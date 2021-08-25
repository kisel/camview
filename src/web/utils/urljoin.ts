export function urljoin(...parts: string[]) {
    return parts.join('/').replace(/[/][/]*/g, '/')
}

export function queryOptions(...opts: string[]) {
    return opts.filter(x => x).join('&')
}
