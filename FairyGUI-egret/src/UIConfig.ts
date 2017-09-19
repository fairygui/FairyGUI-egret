
module fairygui {

    export class UIConfig {
        public constructor() {
        }

        //Default font name
        public static defaultFont: string = "宋体";

        //Resource using in Window.ShowModalWait for locking the window.
        public static windowModalWaiting: string;
        //Resource using in GRoot.ShowModalWait for locking the screen.
        public static globalModalWaiting: string;

        //When a modal window is in front, the background becomes dark.
        public static modalLayerColor: number = 0x333333;
        public static modalLayerAlpha: number = 0.2;

        //Default button click sound
        public static buttonSound: string;
        public static buttonSoundVolumeScale: number = 1;

        //Default button click sound
        public static horizontalScrollBar: string;
        public static verticalScrollBar: string;
        //Scrolling step in pixels
        public static defaultScrollSpeed: number = 25;
        // Speed ratio of scrollpane when its touch dragging.
        public static defaultTouchScrollSpeedRatio: number = 1;
        //Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.
        public static defaultScrollBarDisplay: number = ScrollBarDisplayType.Visible;
        //Allow dragging the content to scroll. Recommeded true for mobile.
        public static defaultScrollTouchEffect: boolean = true;
        //The "rebound" effect in the scolling container. Recommeded true for mobile.
        public static defaultScrollBounceEffect: boolean = true;

        //Resources for PopupMenu.
        public static popupMenu: string;
        //Resources for seperator of PopupMenu.
        public static popupMenu_seperator: string;
        //In case of failure of loading content for GLoader, use this sign to indicate an error.
        public static loaderErrorSign: string;
        //Resources for tooltips.
        public static tooltipsWin: string;

        //Max items displayed in combobox without scrolling.
        public static defaultComboBoxVisibleItemCount: number = 10;

        // Pixel offsets of finger to trigger scrolling.
        public static touchScrollSensitivity: number = 20;

        // Pixel offsets of finger to trigger dragging.
        public static touchDragSensitivity: number = 10;

        // Pixel offsets of mouse pointer to trigger dragging.
        public static clickDragSensitivity: number = 2;

        // When click the window, brings to front automatically.
        public static bringWindowToFrontOnClick: boolean = true;

        public static frameTimeForAsyncUIConstruction: number = 2;
    }
}