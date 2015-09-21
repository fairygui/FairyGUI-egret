declare module egret {
    /**
     * @private
     */
    class NativeVersionController extends egret.EventDispatcher implements IVersionController {
        constructor();
        /**
         * 本地版本信息文件存储路径
         */
        private localVersionDataPath;
        /**
         * 本地版本信息文件，记录了本地文件版本信息
         */
        private localVersionData;
        /**
         * 本地版本信息文件存储路径
         */
        private changeVersionDataPath;
        /**
         * 当前版本信息文件，记录了当前版本中相对于基础版本变化的文件
         */
        private changeVersionData;
        /**
         * 本地版本信息文件存储路径
         */
        private baseVersionDataPath;
        /**
         * 基础版本信息文件
         */
        private baseVersionData;
        private newCode;
        private localVersionCodePath;
        private serverVersionCodePath;
        private _load;
        fetchVersion(): void;
        private initLocalVersionData();
        private deleteFile(file);
        private loadCodeVersion();
        private loadBaseVersion(neesUpdate);
        private loadBaseOver();
        private _call;
        private loadFile(file, call?);
        private fileLoadComplete(e);
        private loadError(e);
        private loadOver();
        private save(path, value);
        private getData(filePath, isApp);
        private getLocalData(filePath);
        private getLocalDataByOld(filePath);
        /**
         * 获取所有有变化的文件
         * @returns {Array<string>}
         */
        getChangeList(): Array<string>;
        private compareVersion(oldVersion, newVersion, url);
        /**
         * 检查文件是否是最新版本
         */
        checkIsNewVersion(url: string): boolean;
        /**
         * 保存本地版本信息文件
         */
        saveVersion(url: string): void;
        getVirtualUrl(url: string): string;
    }
}

