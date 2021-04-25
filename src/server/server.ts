import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import {current_config} from './config'
import { ListResponse, ListItem } from '../common/models';
import { apiError, apiWrapper } from './utils';
import { getDirFilenames, getSubdirNames, verifySafeFileName } from './fileutils';
import tmp = require('tmp');
import { convertToMp4 } from './ffmpeg';

const app = express();
const router = express();

router.get('/api/list/', apiWrapper<ListResponse>(async req => {
    const dirnames = await getSubdirNames(current_config.storage);
    return {
        items: dirnames.map( dirname => ({name: dirname}) as ListItem)
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
    const filenames = await getDirFilenames(path.join(current_config.storage, camname, date, hour), /.*[.]ts$/);
    return {
        items: filenames.map( fn => ({name: fn.replace(/[.]ts$/, '.mp4')}) as ListItem)
    }
}));

router.get('/api/list/:camname/:date/:hour/:basename.mp4', async (req, res) => {
    const camname = verifySafeFileName(req.params.camname);
    const date = verifySafeFileName(req.params.date);
    const hour = verifySafeFileName(req.params.hour);
    const basefn = verifySafeFileName(req.params.basename);
    const tsfile = path.join(current_config.storage, camname, date, hour, `${basefn}.ts`);

    tmp.dir(async (err, tmppath, cleanupCallback) => {
        if (err) {
            apiError(res, err);
        } else {
            const tmpFile = path.join(tmppath, `${basefn}.mp4`);
            const ffmpegError = await convertToMp4(tsfile, tmpFile).then(()=>null).catch((e)=>e);
            if (ffmpegError != null) {
                apiError(res, ffmpegError);
            } else {
                await new Promise<void>((resolve, _reject) => {
                    res.sendFile(tmpFile, (err) => {
                        if (err != null) {
                            console.log(`Unexpected error while sending file ${tmpFile}`)
                            res.end();
                        }
                        resolve();
                    });
                });
            }
            cleanupCallback();
        }
      });
});


router.all('/api/*', (req, res) => {
    res.status(404).json({error: `method not found: ${req.path}`});
});

const publicDir = path.join(__dirname, '../../public');
router.use(express.static(publicDir));

router.get('*', (req, res) => {
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
