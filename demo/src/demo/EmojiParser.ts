
class EmojiParser extends fgui.UBBParser {
    public constructor() {
        super();

        TAGS.forEach(element => {
            this._handlers[":" + element] = this.onTag_Emoji;
        });
    }

    private onTag_Emoji(tagName: string, end: boolean, attr: string): string {
        return "<img src='" + fgui.UIPackage.getItemURL("Chat", tagName.substring(1).toLowerCase()) + "'/>";
    }
}

const TAGS: Array<string> = ["88", "am", "bs", "bz", "ch", "cool", "dhq", "dn", "fd", "gz", "han", "hx", "hxiao", "hxiu"];