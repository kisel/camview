import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import {current_config} from './config'
import { ListResponse, ListItem, CamMetadataResponse } from '../common/models';
import { apiWrapper, errorWrapper, sendFileHelper, sendNotFound } from './utils';
import { FileInfo, findNewestFileDeep, getDirFilenames, getSubdirNames, isSafeFileName, verifySafeFileName } from './fileutils';
import { convertFilesToMp4, convertToMp4, getVideoThumbnail, reencodeToMp4H264 } from './ffmpeg';
import { apiFileGenWrapper } from './tmpfileproc';

import tmp = require('tmp');
import { readMetadataForFiles, readVideoMetadataFile } from './metadata';
import { getDetectorThumbnailFile } from './detector_utils';
import { selectVideoSourceByClientInput } from './video_source';
const promMid = require('express-prometheus-middleware');

tmp.setGracefulCleanup();

const app = express();

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 3, 5, 10],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));

app.get('/healthz', (_req, res) => {
    res.json({ok: true});
});
app.get('/readyz', (_req, res) => {
    res.json({ok: true});
});

const router = express();

router.get('/api/list/', apiWrapper<ListResponse>(async req => {
    if (current_config.cameras != null && current_config.cameras.length > 0) {
        return { items: current_config.cameras }
    } else {
        const dirnames = await getSubdirNames(current_config.storage);
        return {
            items: dirnames.map(dirname => ({ name: dirname }))
        }
    }
}));

router.get('/api/list/:camname', apiWrapper<ListResponse>(async req => {
    const camname = verifySafeFileName(req.params.camname);
    const dirnames = await getSubdirNames(path.join(current_config.storage, camname));
    return {
        items: dirnames.map( dirname => ({name: dirname}) as ListItem)
    }
}));

router.get('/api/list/:camname/:date', apiWrapper<ListResponse>(async req => {
    const camname = verifySafeFileName(req.params.camname);
    const date = verifySafeFileName(req.params.date);
    const dirnames = await getSubdirNames(path.join(current_config.storage, camname, date));
    return {
        items: dirnames.map( dirname => ({name: dirname}) as ListItem)
    }
}));

router.get('/api/list/:camname/:date/:hour', apiWrapper<ListResponse>(async req => {
    const camname = verifySafeFileName(req.params.camname);
    const date = verifySafeFileName(req.params.date);
    const hour = verifySafeFileName(req.params.hour);
    const baseDir = path.join(current_config.storage, camname, date, hour)
    const filenames = await getDirFilenames(baseDir, /.*[.]ts$/);
    return {
        items: filenames.map( fn => ({name: fn.replace(/[.]ts$/, '.mp4')}) as ListItem),
        metadata: await readMetadataForFiles([camname, date, hour], filenames)
    }
}));

router.get('/api/camera/metadata', apiWrapper<CamMetadataResponse>(async req => {
    const {camera_metadata} = current_config;
    return {camera_metadata};
}));

router.get('/api/video/:vformat(mp4|mp4-legacy)/:camname/:date/:hour/:basename.mp4', errorWrapper(async (req, res) => {
    const basefn = verifySafeFileName(req.params.basename);
    const {vformat} = req.params;
    const selectedFile = await selectVideoSourceByClientInput(
        req.params.camname,
        req.params.date,
        req.params.hour,
        req.params.basename
    );

    await apiFileGenWrapper(req, res, async (tmpDir)=> {
        const tmpFile = path.join(tmpDir, `${basefn}.mp4`);
        if (vformat == "mp4-legacy") {
            await reencodeToMp4H264(selectedFile, tmpFile)
        } else if (vformat == "mp4") {
            await convertToMp4(selectedFile, tmpFile)
        } else {
            console.log(`Incorrect request: ${req.url}`)
        }
        return tmpFile;
    });
}));

// concatenated video for the hour
router.get('/api/video/:vformat(mp4|mp4-legacy)/:camname/:date/:hour.mp4', errorWrapper(async (req, res) => {
    const camname = verifySafeFileName(req.params.camname);
    const date = verifySafeFileName(req.params.date);
    const hour = verifySafeFileName(req.params.hour);
    const {vformat} = req.params;
    const baseDir = path.join(current_config.storage, camname, date, hour)
    let filenames = await getDirFilenames(baseDir, /.*[.]ts$/);
    filenames.sort();
    filenames = filenames.map(fn => path.join(baseDir, fn))

    await apiFileGenWrapper(req, res, async (tmpDir)=> {
        const tmpFile = path.join(tmpDir, `${date}_${hour}.mp4`);
        if (vformat == "mp4-legacy") {
            throw new Error("not implemented");
        } else if (vformat == "mp4") {
            const {done, stop} = convertFilesToMp4(filenames, tmpFile)
            req.on("close", () => stop())
            await done;
        } else {
            console.log(`Incorrect request: ${req.url}`)
        }
        return tmpFile;
    });
}));

function getStoragePathFromParams(req: express.Request, keys: string[]): string {
    const paramPath = keys.map(k => verifySafeFileName(req.params[k]));
    const resPath = path.join(current_config.storage, ...paramPath);
    return resPath;
}
router.get('/api/image/:camname/:date/:hour/:basename.:ext/', errorWrapper(async (req, res) => {
    const {resolution,detector} = req.query as any;
    const camname = verifySafeFileName(req.params.camname);
    const date = verifySafeFileName(req.params.date);
    const hour = verifySafeFileName(req.params.hour);
    const basefn = verifySafeFileName(req.params.basename);
    const selectedVideoFile = await selectVideoSourceByClientInput(
        req.params.camname,
        req.params.date,
        req.params.hour,
        req.params.basename
    );
    if (!selectedVideoFile) {
        sendNotFound(res);
        return;
    }
    const selectedVideoVileBasename = verifySafeFileName(path.basename(selectedVideoFile).replace(/[.](mp4|ts)$/, ''));

    if (detector) {
        const detectorThumbFn = await getDetectorThumbnailFile([camname, date, hour], selectedVideoVileBasename, detector)
        if (detectorThumbFn) {
            await sendFileHelper(req, res, detectorThumbFn)
            return;
        }
    }

    await apiFileGenWrapper(req, res, async (tmpDir)=> {
        const tmpFile = path.join(tmpDir, `${basefn}.jpg`);
        await getVideoThumbnail(selectedVideoFile, tmpFile, resolution)
        if (!detector) {
            res.set('Cache-control', `public, max-age=${current_config.cache_time}`)
        }
        return tmpFile;
    });
}));

router.get('/api/detector/result/:camname/:date/:hour/:basename.:ext', apiWrapper(async (req) => {
    const camname = verifySafeFileName(req.params.camname);
    const date = verifySafeFileName(req.params.date);
    const hour = verifySafeFileName(req.params.hour);
    const basefn = verifySafeFileName(req.params.basename);
    return readVideoMetadataFile(camname, date, hour, basefn)
}));

function tsFileFilter(fi: FileInfo) {
    return /.*[.]ts$/.test(fi.name);
}

const fullPathLen = ['camname', 'date', 'hour'].length;
async function deepThumbHandler(req: express.Request, res: express.Response, paramKeys: string[], cacheTime?: number) {
    const {resolution, def_hour} = req.query as any;
    const relPath = paramKeys.map(k => verifySafeFileName(req.params[k]));
    const searchdir = path.join(current_config.storage, ...relPath);
    const searchdefaults = (def_hour && isSafeFileName(def_hour)) ? [undefined, def_hour] : undefined
    const fi = await findNewestFileDeep(searchdir, fullPathLen - paramKeys.length, tsFileFilter, searchdefaults);
    // console.log("found last:", fi.fullpath)

    await apiFileGenWrapper(req, res, async (tmpDir)=> {
        const tmpFile = path.join(tmpDir, `thumbnail.jpg`);
        await getVideoThumbnail(fi.fullpath, tmpFile, resolution);
        if (tmpFile && cacheTime != 0) {
            res.set('Cache-control', `public, max-age=${cacheTime || current_config.cache_time}`)
        }
        return tmpFile;
    });
}
router.get('/api/image/:camname/:date/:hour/', errorWrapper(async (req, res) => {
    await deepThumbHandler(req, res, ['camname', 'date', 'hour'])
}));

router.get('/api/image/:camname/:date/', errorWrapper(async (req, res) => {
    await deepThumbHandler(req, res, ['camname', 'date'])
}));

router.get('/api/image/:camname/', errorWrapper(async (req, res) => {
    await deepThumbHandler(req, res, ['camname'], 0)
}));

if (current_config.streams) {
    console.log(`Mounted ${current_config.streams} to /api/streams/data`)
    router.use('/api/streams/data/', express.static(current_config.streams));
}

router.all('/api/*', (req, res) => {
    res.status(404).json({error: `not found: ${req.path}`});
});

const publicDir = path.join(__dirname, '../../public');
router.use(express.static(publicDir));

router.get('/token/*', (req, res) => {
    // dummy route for external authorization
    res.redirect('/');
});

router.get('*', (req, res) => {
    console.log(`Serving index.html to ${req.url} client: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`)
    res.sendFile('index.html', {root: publicDir});
});

app.use('/', router);

function startup() {
    const server = new http.Server(app);
    server.timeout = 600_000;
    server.listen(current_config.http_port, async () => {
        console.log(`App listening on port ${current_config.http_port}`);
        console.info('config:', current_config.http_port);
    });
}

startup();
