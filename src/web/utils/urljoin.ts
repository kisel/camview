export function urljoin(...parts: string[]) {
    return parts.join('/').replace(/[/][/]*/g, '/')
}
