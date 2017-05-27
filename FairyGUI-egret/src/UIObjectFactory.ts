
module fairygui {

    export class UIObjectFactory {
        public static packageItemExtensions: any = {};
        private static loaderType: any;

        public constructor() {
        }


        public static setPackageItemExtension(url: string, type: any): void {
            if (url == null)
                throw "Invaild url: " + url;

            var pi: PackageItem = UIPackage.getItemByURL(url);
            if (pi != null)
                pi.extensionType = type;

            UIObjectFactory.packageItemExtensions[url] = type;
        }

        public static setLoaderExtension(type: any): void {
            UIObjectFactory.loaderType = type;
        }

        public static $resolvePackageItemExtension(pi: PackageItem): void {
            pi.extensionType = UIObjectFactory.packageItemExtensions["ui://" + pi.owner.id + pi.id];
            if (!pi.extensionType)
                pi.extensionType = UIObjectFactory.packageItemExtensions["ui://" + pi.owner.name + "/" + pi.name];
        }

        public static newObject(pi: PackageItem): GObject {
            switch (pi.type) {
                case PackageItemType.Image:
                    return new GImage();

                case PackageItemType.MovieClip:
                    return new GMovieClip();

                case PackageItemType.Component:
                    {
                        var cls: any = pi.extensionType;
                        if (cls)
                            return new cls();

                        var xml: any = pi.owner.getItemAsset(pi);
                        var extention: string = xml.attributes.extention;
                        if (extention != null) {
                            switch (extention) {
                                case "Button":
                                    return new GButton();

                                case "Label":
                                    return new GLabel();

                                case "ProgressBar":
                                    return new GProgressBar();

                                case "Slider":
                                    return new GSlider();

                                case "ScrollBar":
                                    return new GScrollBar();

                                case "ComboBox":
                                    return new GComboBox();

                                default:
                                    return new GComponent();
                            }
                        }
                        else
                            return new GComponent();
                    }
            }
            return null;
        }

        public static newObject2(type: string): GObject {
            switch (type) {
                case "image":
                    return new GImage();

                case "movieclip":
                    return new GMovieClip();

                case "component":
                    return new GComponent();

                case "text":
                    return new GTextField();

                case "richtext":
                    return new GRichTextField();

                case "inputtext":
                    return new GTextInput();

                case "group":
                    return new GGroup();

                case "list":
                    return new GList();

                case "graph":
                    return new GGraph();

                case "loader":
                    if (UIObjectFactory.loaderType != null)
                        return new UIObjectFactory.loaderType();
                    else
                        return new GLoader();
            }
            return null;
        }
    }
}