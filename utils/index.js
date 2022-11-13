export const isFile = (path) => /.*\.\w{3,4}$/.test(path);
export const isRootFolder = (path) => !path.split("/")?.[1];
