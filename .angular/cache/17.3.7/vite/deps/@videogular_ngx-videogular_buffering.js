import {
  VgApiService,
  VgCoreModule
} from "./chunk-6AM5RRNF.js";
import {
  CommonModule
} from "./chunk-TFSXVW2B.js";
import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  NgModule,
  ViewEncapsulation$1,
  setClassMetadata,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart
} from "./chunk-5DWDHDVP.js";
import "./chunk-SAVXX6OM.js";
import "./chunk-SG3BCSKH.js";
import "./chunk-PQ7O3X3G.js";
import "./chunk-PZQZAEDH.js";

// node_modules/@videogular/ngx-videogular/fesm2022/videogular-ngx-videogular-buffering.mjs
var _VgBufferingComponent = class _VgBufferingComponent {
  constructor(ref, API) {
    this.API = API;
    this.checkInterval = 50;
    this.currentPlayPos = 0;
    this.lastPlayPos = 0;
    this.subscriptions = [];
    this.isBuffering = false;
    this.elem = ref.nativeElement;
  }
  ngOnInit() {
    if (this.API.isPlayerReady) {
      this.onPlayerReady();
    } else {
      this.subscriptions.push(this.API.playerReadyEvent.subscribe(() => this.onPlayerReady()));
    }
  }
  onPlayerReady() {
    this.target = this.API.getMediaById(this.vgFor);
    this.subscriptions.push(this.target.subscriptions.bufferDetected.subscribe((isBuffering) => this.onUpdateBuffer(isBuffering)));
  }
  onUpdateBuffer(isBuffering) {
    this.isBuffering = isBuffering;
  }
  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
};
_VgBufferingComponent.ɵfac = function VgBufferingComponent_Factory(t) {
  return new (t || _VgBufferingComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(VgApiService));
};
_VgBufferingComponent.ɵcmp = ɵɵdefineComponent({
  type: _VgBufferingComponent,
  selectors: [["vg-buffering"]],
  hostVars: 2,
  hostBindings: function VgBufferingComponent_HostBindings(rf, ctx) {
    if (rf & 2) {
      ɵɵclassProp("is-buffering", ctx.isBuffering);
    }
  },
  inputs: {
    vgFor: "vgFor"
  },
  decls: 3,
  vars: 0,
  consts: [[1, "vg-buffering"], [1, "bufferingContainer"], [1, "loadingSpinner"]],
  template: function VgBufferingComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵelementStart(0, "div", 0)(1, "div", 1);
      ɵɵelement(2, "div", 2);
      ɵɵelementEnd()();
    }
  },
  styles: ["vg-buffering{display:none;z-index:201}vg-buffering.is-buffering{display:block}.vg-buffering{position:absolute;display:block;width:100%;height:100%}.vg-buffering .bufferingContainer{width:100%;position:absolute;cursor:pointer;top:50%;margin-top:-50px;zoom:1;filter:alpha(opacity=60);opacity:.6}.vg-buffering .loadingSpinner{background-color:#0000;border:5px solid rgba(255,255,255,1);opacity:.9;border-top:5px solid rgba(0,0,0,0);border-left:5px solid rgba(0,0,0,0);border-radius:50px;box-shadow:0 0 35px #fff;width:50px;height:50px;margin:0 auto;-moz-animation:spin .5s infinite linear;-webkit-animation:spin .5s infinite linear}.vg-buffering .loadingSpinner .stop{-webkit-animation-play-state:paused;-moz-animation-play-state:paused}\n"],
  encapsulation: 2
});
var VgBufferingComponent = _VgBufferingComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(VgBufferingComponent, [{
    type: Component,
    args: [{
      selector: "vg-buffering",
      encapsulation: ViewEncapsulation$1.None,
      template: `<div class="vg-buffering">
    <div class="bufferingContainer">
      <div class="loadingSpinner"></div>
    </div>
  </div>`,
      styles: ["vg-buffering{display:none;z-index:201}vg-buffering.is-buffering{display:block}.vg-buffering{position:absolute;display:block;width:100%;height:100%}.vg-buffering .bufferingContainer{width:100%;position:absolute;cursor:pointer;top:50%;margin-top:-50px;zoom:1;filter:alpha(opacity=60);opacity:.6}.vg-buffering .loadingSpinner{background-color:#0000;border:5px solid rgba(255,255,255,1);opacity:.9;border-top:5px solid rgba(0,0,0,0);border-left:5px solid rgba(0,0,0,0);border-radius:50px;box-shadow:0 0 35px #fff;width:50px;height:50px;margin:0 auto;-moz-animation:spin .5s infinite linear;-webkit-animation:spin .5s infinite linear}.vg-buffering .loadingSpinner .stop{-webkit-animation-play-state:paused;-moz-animation-play-state:paused}\n"]
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: VgApiService
    }];
  }, {
    vgFor: [{
      type: Input
    }],
    isBuffering: [{
      type: HostBinding,
      args: ["class.is-buffering"]
    }]
  });
})();
var _VgBufferingModule = class _VgBufferingModule {
};
_VgBufferingModule.ɵfac = function VgBufferingModule_Factory(t) {
  return new (t || _VgBufferingModule)();
};
_VgBufferingModule.ɵmod = ɵɵdefineNgModule({
  type: _VgBufferingModule,
  declarations: [VgBufferingComponent],
  imports: [CommonModule, VgCoreModule],
  exports: [VgBufferingComponent]
});
_VgBufferingModule.ɵinj = ɵɵdefineInjector({
  imports: [CommonModule, VgCoreModule]
});
var VgBufferingModule = _VgBufferingModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(VgBufferingModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, VgCoreModule],
      declarations: [VgBufferingComponent],
      exports: [VgBufferingComponent]
    }]
  }], null, null);
})();
export {
  VgBufferingComponent,
  VgBufferingModule
};
//# sourceMappingURL=@videogular_ngx-videogular_buffering.js.map
