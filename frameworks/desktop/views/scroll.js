// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/scroller');
sc_require('mixins/border');

/** @class

  Implements a complete scroll view.  This class uses a manual implementation
  of scrollers in order to properly support clipping frames.
  
  Important Events:
  
  - contentView frame size changes (to autoshow/hide scrollbar - adjust scrollbar size)
  - horizontalScrollOffset change
  - verticalScrollOffsetChanges
  - scroll wheel events
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollView = SC.View.extend(SC.Border, {
  /** @scope SC.ScrollView.prototype */
  classNames: ['sc-scroll-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  isScrollable: YES,
  
  /** 
    The content view you want the scroll view to manage. This will be assigned to the contentView of the clipView also.
  */
  contentView: null,

  /**
    The current horizontal scroll offset. Changing this value will update both the contentView and the horizontal scroller, if there is one.
  */
  horizontalScrollOffset: function(key, value) {
    if (value !== undefined) {
      this._scroll_horizontalScrollOffset = Math.max(0,Math.min(this.get('maximumHorizontalScrollOffset'), value)) ;
    }

    return this._scroll_horizontalScrollOffset||0;
  }.property().cacheable(),
  
  /**
    The current vertical scroll offset.  Changing this value will update both the contentView and the vertical scroller, if there is one.
  */
  verticalScrollOffset: function(key, value) {
    if (value !== undefined) {
      this._scroll_verticalScrollOffset = Math.max(0,Math.min(this.get('maximumVerticalScrollOffset'), value)) ;
    }

    return this._scroll_verticalScrollOffset||0;
  }.property().cacheable(),
  
  /**
    The maximum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0.
    
    @property {Number}
  */
  maximumHorizontalScrollOffset: function() {
    if (!this.get('canScrollHorizontal')) return 0 ;
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0 ;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view.calculatedWidth && view.calculatedWidth!==0){
      contentWidth = view.calculatedWidth; 
    }
    contentWidth *= this.get("scale");
    
    var containerWidth = this.get('containerView').get('frame').width ;
    return Math.max(0, contentWidth-containerWidth) ;
  }.property(),
  
  /**
    The maximum vertical scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0.
    
    @property {Number}
  */
  maximumVerticalScrollOffset: function() {
    if (!this.get('canScrollVertical')) return 0 ;
    var view = this.get('contentView') ;
    var contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0 ;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view.calculatedHeight && view.calculatedHeight!==0){
      contentHeight = view.calculatedHeight; 
    }
    contentHeight *= this.get("scale");
    
    var containerHeight = this.get('containerView').get('frame').height ;
    return Math.max(0, contentHeight-containerHeight) ;
  }.property(),
  
  /** 
    Amount to scroll one vertical line.
  
    Used by the default implementation of scrollDownLine() and scrollUpLine().  
    Defaults to 20px.
  */
  verticalLineScroll: 20,
  
  /**
    Amount to scroll one horizontal line.
  
    Used by the default implementation of scrollLeftLine() and 
    scrollRightLine(). Defaults to 20px.
  */
  horizontalLineScroll: 20,
  
  /**
    Amount to scroll one vertical page.
    
    Used by the default implementation of scrollUpPage() and scrollDownPage(). 
    Defaults to current frame height.
  */
  verticalPageScroll: function() {
    return this.get('frame').height ;
  }.property('frame'),
  
  /**
    Amount to scroll one horizontal page.
    
    Used by the default implementation of scrollLeftPage() and 
    scrollRightPage().  Defaults to current innerFrame width.
  */
  horizontalPageScroll: function() {
    return this.get('frame').width ;  
  }.property('frame'),
    
  // ..........................................................
  // SCROLLERS
  // 
  
  /** 
    YES if the view should maintain a horizontal scroller.   This property 
    must be set when the view is created.
    
    @property {Boolean}
  */
  hasHorizontalScroller: YES,
  
  /**
    The horizontal scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasHorizontalScroller is 
    NO.
    
    @property {SC.View}
  */
  horizontalScrollerView: SC.ScrollerView,
  
  /**
    YES if the horizontal scroller should be visible.  You can change this 
    property value anytime to show or hide the horizontal scroller.  If you 
    do not want to use a horizontal scroller at all, you should instead set 
    hasHorizontalScroller to NO to avoid creating a scroller view in the 
    first place.
    
    @property {Boolean}
  */
  isHorizontalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollHorizontal: function() {
    return !!(this.get('hasHorizontalScroller') && 
      this.get('horizontalScrollerView') && 
      this.get('isHorizontalScrollerVisible')) ;
  }.property('isHorizontalScrollerVisible').cacheable(),
  
  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES 
    for this property to have any effect.  
  */
  autohidesHorizontalScroller: YES,
  
  /** 
    YES if the view shuld maintain a vertical scroller.   This property must 
    be set when the view is created.
    
    @property {Boolean}
  */
  hasVerticalScroller: YES,
  
  /**
    The vertical scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasVerticalScroller is NO.
    
    @property {SC.View}
  */
  verticalScrollerView: SC.ScrollerView,
  
  /**
    YES if the vertical scroller should be visible.  You can change this 
    property value anytime to show or hide the vertical scroller.  If you do 
    not want to use a vertical scroller at all, you should instead set 
    hasVerticalScroller to NO to avoid creating a scroller view in the first 
    place.
    
    @property {Boolean}
  */
  isVerticalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollVertical: function() {
    return !!(this.get('hasVerticalScroller') && 
      this.get('verticalScrollerView') && 
      this.get('isVerticalScrollerVisible')) ;
  }.property('isVerticalScrollerVisible').cacheable(),

  /**
    If YES, the vertical scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasVerticalScroller to YES 
    for this property to have any effect.  
  */
  autohidesVerticalScroller: YES,
  
  /**
    Use this property to set the 'bottom' offset of your vertical scroller, 
    to make room for a thumb view or other accessory view. Default is 0.
    
    @property {Number}
  */
  verticalScrollerBottom: 0,
  
  /**
    Use this to overlay the vertical scroller.
    
    This ensures that the container frame will not resize to accomodate the
    vertical scroller, hence overlaying the scroller on top of 
    the container.
  
    @property {Boolean}
  */
  verticalOverlay: NO,
  
  /**
    Use this to overlay the horizontal scroller.
    
    This ensures that the container frame will not resize to accomodate the
    horizontal scroller, hence overlaying the scroller on top of 
    the container
    
    @property {Boolean}
  */
  horizontalOverlay: NO,
  
  /**
    Use to control the positioning of the vertical scroller.  If you do not
    set 'verticalOverlay' to YES, then the content view will be automatically
    sized to meet the left edge of the vertical scroller, wherever it may be.
    This allows you to easily, for example, have “one pixel higher and one
    pixel lower” scroll bars that blend into their parent views.
    
    If you do set 'verticalOverlay' to YES, then the scroller view will
    “float on top” of the content view.
    
    Example: { top: -1, bottom: -1, right: 0 }
  */
  verticalScrollerLayout: null,
  
  /**
    Use to control the positioning of the horizontal scroller.  If you do not
    set 'horizontalOverlay' to YES, then the content view will be
    automatically sized to meet the top edge of the horizontal scroller,
    wherever it may be.
    
    If you do set 'horizontalOverlay' to YES, then the scroller view will
    “float on top” of the content view.
    
    Example: { left: 0, bottom: 0, right: 0 }
  */
  horizontalScrollerLayout: null,
  
  // ..........................................................
  // CUSTOM VIEWS
  // 
  
  /**
    The container view that will contain your main content view.  You can 
    replace this property with your own custom subclass if you prefer.
    
    The default is a ContainerView which has a contentClippingFrame that will
    be normal on desktop, but will show three screenfulls on touch devices (making
    scrolling a bit nicer).
    
    @type {SC.ContainerView}
  */
  containerView: SC.ContainerView.extend({
    contentClippingFrame: function() {
      var f = SC.clone(this.get("clippingFrame"));
      if (SC.browser.touch) {
        f.x -= f.width;
        f.width += f.width * 2;
        f.y -= f.height;
        f.height += f.height * 2;
      }
      return f;
    }.property("clippingFrame")
  }),
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Scrolls the receiver to the specified x,y coordinate.  This should be the
    offset into the contentView you want to appear at the top-left corner of
    the scroll view.
    
    This method will contrain the actual scroll based on whether the view
    can scroll in the named direction and the maximum distance it can
    scroll.
    
    If you only want to scroll in one direction, pass null for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} the x scroll location
    @param y {Number} the y scroll location
    @returns {SC.ScrollView} receiver
  */
  scrollTo: function(x,y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    if (!SC.none(x)) {
      x = Math.max(0,Math.min(this.get('maximumHorizontalScrollOffset'), x)) ;
      this.set('horizontalScrollOffset', x) ;
    }
    
    if (!SC.none(y)) {
      y = Math.max(0,Math.min(this.get('maximumVerticalScrollOffset'), y)) ;
      this.set('verticalScrollOffset', y) ;
    }
    
    return this ;
  },
  
  /**
    Scrolls the receiver in the horizontal and vertical directions by the 
    amount specified, if allowed.  The actual scroll amount will be 
    constrained by the current scroll view settings.
    
    If you only want to scroll in one direction, pass null or 0 for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} change in the x direction (or hash)
    @param y {Number} change in the y direction
    @returns {SC.ScrollView} receiver
  */
  scrollBy: function(x , y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    // if null, undefined, or 0, pass null; otherwise just add current offset
    x = (x) ? this.get('horizontalScrollOffset')+x : null ;
    y = (y) ? this.get('verticalScrollOffset')+y : null ;
    return this.scrollTo(x,y) ;
  },
  
  /**
    Scroll the view to make the view's frame visible.  For this to make sense,
    the view should be a subview of the contentView.  Otherwise the results
    will be undefined.
    
    @param {SC.View} view view to scroll or null to scroll receiver visible
    @returns {Boolean} YES if scroll position was changed
  */
  scrollToVisible: function(view) {
    
    // if no view is passed, do default
    if (arguments.length === 0) return sc_super(); 
    
    var contentView = this.get('contentView') ;
    if (!contentView) return NO; // nothing to do if no contentView.

    // get the frame for the view - should work even for views with static 
    // layout, assuming it has been added to the screen.
    var vf = view.get('frame');
    if (!vf) return NO; // nothing to do
    
    // convert view's frame to an offset from the contentView origin.  This
    // will become the new scroll offset after some adjustment.
    vf = contentView.convertFrameFromView(vf, view.get('parentView')) ;
    
    // find current visible frame.
    var vo = SC.cloneRect(this.get('containerView').get('frame')) ;
    
    vo.x = this.get('horizontalScrollOffset') ;
    vo.y = this.get('verticalScrollOffset') ;

    var origX = vo.x, origY = vo.y;
    
    // if top edge is not visible, shift origin
    vo.y -= Math.max(0, SC.minY(vo) - SC.minY(vf)) ;
    vo.x -= Math.max(0, SC.minX(vo) - SC.minX(vf)) ;
    
    // if bottom edge is not visible, shift origin
    vo.y += Math.max(0, SC.maxY(vf) - SC.maxY(vo)) ;
    vo.x += Math.max(0, SC.maxX(vf) - SC.maxX(vo)) ;
    
    // scroll to that origin.
    if ((origX !== vo.x) || (origY !== vo.y)) {
      this.scrollTo(vo.x, vo.y);
      return YES ;
    } else return NO;
  },
  
  /**
    Scrolls the receiver down one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollDownLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver up one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollUpLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, 0-this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver right one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollRightLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver left one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollLeftLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(0-this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver down one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollDownPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, this.get('verticalPageScroll')*pages) ;
  },
  
  /**
    Scrolls the receiver up one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollUpPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, 0-(this.get('verticalPageScroll')*pages)) ;
  },
  
  /**
    Scrolls the receiver right one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollRightPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(this.get('horizontalPageScroll')*pages, null) ;
  },
  
  /**
    Scrolls the receiver left one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollLeftPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(0-(this.get('horizontalPageScroll')*pages), null) ;
  },
  
  /**
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.
    
    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function() {
    // get horizontal scroller/determine if we should have a scroller
    var hscroll = this.get('hasHorizontalScroller') ? this.get('horizontalScrollerView') : null ;
    var hasHorizontal = hscroll && this.get('isHorizontalScrollerVisible');
    
    // get vertical scroller/determine if we should have a scroller
    var vscroll = this.get('hasVerticalScroller') ? this.get('verticalScrollerView') : null ;
    var hasVertical = vscroll && this.get('isVerticalScrollerVisible') ;
    
    if (SC.browser.touch) hasVertical = hasHorizontal = NO;
    
    // get the containerView
    var clip = this.get('containerView') ;
    var clipLayout = { left: 0, top: 0 } ;
    var t, layout, vo, ho, vl, hl;
    
    var ht = ((hasHorizontal) ? hscroll.get('scrollbarThickness') : 0) ;
    var vt = (hasVertical) ?   vscroll.get('scrollbarThickness') : 0 ;
    
    if (hasHorizontal) {
      hl     = this.get('horizontalScrollerLayout');
      layout = { 
        left: (hl ? hl.left : 0), 
        bottom: (hl ? hl.bottom : 0), 
        right: (hl ? hl.right + vt-1 : vt-1), 
        height: ht 
      };
      hscroll.set('layout', layout) ;
      ho = this.get('horizontalOverlay');
      clipLayout.bottom = ho ? 0 : (layout.bottom + ht) ;
    } else {
      clipLayout.bottom = 0 ;
    }
    if (hscroll) hscroll.set('isVisible', hasHorizontal) ;
    
    if (hasVertical) {
      ht     = ht + this.get('verticalScrollerBottom') ;
      vl     = this.get('verticalScrollerLayout');
      layout = { 
        top: (vl ? vl.top : 0), 
        bottom: (vl ? vl.bottom + ht : ht), 
        right: (vl ? vl.right : 0), 
        width: vt 
      };
      vscroll.set('layout', layout) ;
      vo = this.get('verticalOverlay');
      clipLayout.right = vo ? 0 : (layout.right + vt) ;
    } else {
      clipLayout.right = 0 ;
    }
    if (vscroll) vscroll.set('isVisible', hasVertical) ;
    
    clip.set('layout', clipLayout) ;
  },
  
  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function() {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible'),
  
  // ..........................................................
  // SCROLL WHEEL SUPPORT
  // 
  
  /** @private */ _scroll_wheelDeltaX: 0,
  /** @private */ _scroll_wheelDeltaY: 0,
  
  // save adjustment and then invoke the actual scroll code later.  This will
  // keep the view feeling smooth.
  mouseWheel: function(evt) {
    this._scroll_wheelDeltaX += evt.wheelDeltaX;
    this._scroll_wheelDeltaY += evt.wheelDeltaY;
    this.invokeLater(this._scroll_mouseWheel, 10) ;
    return this.get('canScrollHorizontal') || this.get('canScrollVertical') ;  
  },

  /** @private */
  _scroll_mouseWheel: function() {
    this.scrollBy(this._scroll_wheelDeltaX, this._scroll_wheelDeltaY);
    if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY > 0) {
      this._scroll_wheelDeltaY = Math.floor(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.max(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY < 0){
      this._scroll_wheelDeltaY = Math.ceil(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.min(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else {
      this._scroll_wheelDeltaY = 0;
      this._scroll_wheelDeltaX = 0;
    }
  },
  
  /*..............................................
    SCALING SUPPORT
  */
  
  /**
    Determines whether scaling is allowed.
  */
  canScale: NO,
  
  /**
    The current scale.
  */
  _scale: 1.0,
  scale: function(key, value) {
    if (value !== undefined) {
      this._scale = Math.min(Math.max(this.get("minimumScale"), value), this.get("maximumScale"));
    }
    return this._scale;
  }.property().cacheable(),
  
  /**
    The minimum scale.
  */
  minimumScale: 0.25,
  
  /**
    The maximum scale.
  */
  maximumScale: 2.0,
  
  /**
    Whether to automatically determine the scale range based on the size of the content.
  */
  autoScaleRange: NO,
  
  _scale_css: "",
  
  updateScale: function(scale) {
    if (this.get("content").isScalable) {
      this.get("content").updateScale(scale);
    } else {
      this._scale_css = "scale3d(" + scale + ", " + scale + ", 1)";
    }
  },
  
  /*..............................................
    TOUCH SUPPORT
  */
  acceptsMultitouch: YES,
  
  _applyCSSTransforms: function(layer) {
    var transform = "";
    transform += 'translate3d('+ -this._scroll_horizontalScrollOffset +'px, '+ -this._scroll_verticalScrollOffset+'px,0)';
    transform += "scale3d(" + this._scale + ", " + this._scale + ",1) ";
    layer.style.webkitTransform = transform;
    layer.style.webkitTransformOrigin = "top left";
  },
  
  captureTouch: function(touch) {
    return YES;
  },
  
  touchGeneration: 0,
  touchStart: function(touch) {
    if (!this.tracking) {
      var generation = ++this.touchGeneration;
      this.invokeLater(this.beginTouchesInContent, 150, generation);
    }
    this.beginTouchTracking(touch, YES);
  },

  beginTouchesInContent: function(gen) {
    if (gen !== this.touchGeneration) return;
    var touch = this.touch, itemView;
    if (touch && this.tracking && !this.dragging) {
      touch.touch.captureTouch(this, YES);
    }
  },

  /**
    Initializes the start state of the gesture.

    We keep information about the initial location of the touch so we can
    disambiguate between a tap and a drag.

    @param {Event} evt
  */
  beginTouchTracking: function(touch, starting) {
    var avg = touch.averagedTouchesForView(this, starting);
    
    var verticalScrollOffset = this._scroll_verticalScrollOffset || 0,
        horizontalScrollOffset = this._scroll_horizontalScrollOffset || 0;
    
    if (this.touch && this.touch.timeout) {
      // first, finish up the hack to boost deceleration
      SC.RunLoop.begin();
      this.set("scale", this._scale);
      this.set("verticalScrollOffset", verticalScrollOffset);
      this.set("horizontalScrollOffset", horizontalScrollOffset);
      SC.RunLoop.end();
      
      // now clear the timeout
      clearTimeout(this.touch.timeout);
      this.touch.timeout = null;
    }
    
    // calculate container+content width/height
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0,
        contentHeight = view ? view.get('frame').height : 0;
    
    if(view.calculatedWidth && view.calculatedWidth!==0) contentWidth = view.calculatedWidth;
    if (view.calculatedHeight && view.calculatedHeight !==0) contentHeight = view.calculatedHeight;
    
    var containerWidth = this.get('containerView').get('frame').width,
        containerHeight = this.get('containerView').get('frame').height;
    

    // calculate position in content
    var globalFrame = this.convertFrameToView(this.get("frame"), null),
        positionInContentX = (horizontalScrollOffset + (avg.x - globalFrame.x)) / this._scale,
        positionInContentY = (verticalScrollOffset + (avg.y - globalFrame.y)) / this._scale;
    
    
    this.touch = {
      startTime: touch.timeStamp,
      notCalculated: YES,
      
      enableScrolling: { x: YES, y: YES }, // TODO: get from class properties
      scrolling: { x: NO, y: NO },
      
      // offsets and velocities
      // startScrollOffset: { x: horizontalScrollOffset, y: verticalScrollOffset },
      lastScrollOffset: { x: horizontalScrollOffset, y: verticalScrollOffset },
      startTouchOffset: { x: avg.x, y: avg.y },
      scrollVelocity: { x: 0, y: 0 },
      
      startTouchOffsetInContent: { x: positionInContentX, y: positionInContentY },
      
      containerSize: { width: containerWidth, height: containerHeight },
      contentSize: { width: contentWidth, height: contentHeight },
      
      startScale: this._scale,
      startDistance: avg.d,
      canScale: this.get("canScale"),
      minimumScale: this.get("minimumScale"),
      maximumScale: this.get("maximumScale"),
      
      globalFrame: globalFrame,
      
      // cache some things
      layer: this.get("contentView").get('layer'),

      // some constants
      resistanceCoefficient: 0.998,
      resistanceAsymptote: 320,
      decelerationFromEdge: 0.05,
      accelerationToEdge: 0.08,
      
      // how much percent of the other drag direction you must drag to start dragging that direction too.
      scrollTolerance: { x: 5, y: 5 },
      scaleTolerance: 5,
      secondaryScrollTolerance: 20,
      scrollLock: 100,

      // general status
      lastEventTime: touch.timeStamp,      
      
      // the touch used
      touch: touch
    };

    this.tracking = YES;
    this.dragging = NO;
  },
  
  _adjustForEdgeResistance: function(offset, minOffset, maxOffset, resistanceCoefficient, asymptote) {
    var distanceFromEdge;
    
    // find distance from edge
    if (offset < minOffset) distanceFromEdge = offset - minOffset;
    else if (offset > maxOffset) distanceFromEdge = maxOffset - offset;
    else return offset;
    
    // manipulate logarithmically
    distanceFromEdge = Math.pow(resistanceCoefficient, Math.abs(distanceFromEdge)) * asymptote;
    
    // adjust mathematically
    if (offset < minOffset) distanceFromEdge = distanceFromEdge - asymptote;
    else distanceFromEdge = -distanceFromEdge + asymptote;
    
    // generate final value
    return Math.min(Math.max(minOffset, offset), maxOffset) + distanceFromEdge;
  },
  
  touchesDragged: function(evt, touches) {
    var avg = evt.averagedTouchesForView(this);
    this.updateTouchScroll(avg.x, avg.y, avg.d, evt.timeStamp);
  },
  
  updateTouchScroll: function(touchX, touchY, distance, timeStamp) {
    // get some vars
    var touch = this.touch,
        touchXInFrame = touchX - touch.globalFrame.x,
        touchYInFrame = touchY - touch.globalFrame.y,
        offsetY,
        maxOffsetY,
        offsetX,
        maxOffsetX;
        
    // calculate new position in content
    var positionInContentX = ((this._scroll_horizontalScrollOffset||0) + (touchX - touch.globalFrame.x)) / this._scale,
        positionInContentY = ((this._scroll_verticalScrollOffset||0) + (touchY - touch.globalFrame.y)) / this._scale;
    
    // calculate deltas
    var deltaX = positionInContentX - touch.startTouchOffset.x,
        deltaY = positionInContentY - touch.startTouchOffset.y;
    
    if (!touch.scrolling.x && Math.abs(deltaX) > touch.scrollTolerance.x && touch.enableScrolling.x) {
      // say we are scrolling
      this.dragging = YES;
      touch.scrolling.x = YES;
      touch.scrollTolerance.y = touch.secondaryScrollTolerance;
      
      // reset position
      touch.startTouchOffset.x = touchX;
      deltaX = 0;
    }
    if (!touch.scrolling.y && Math.abs(deltaY) > touch.scrollTolerance.y && touch.enableScrolling.y) {
      // say we are scrolling
      this.dragging = YES;
      touch.scrolling.y = YES;
      touch.scrollTolerance.x = touch.secondaryScrollTolerance;
      
      // reset position
      touch.startTouchOffset.y = touchY;
      deltaY = 0;
    }
    
    // calculate new offset
    if (!touch.scrolling.x && !touch.scrolling.y && !touch.canScale) return;
    if (touch.scrolling.x) {
      touch.scrollTolerance.y = touch.secondaryScrollTolerance;
      if (deltaX > touch.scrollLock && !touch.scrolling.y) touch.enableScrolling.y = NO;
    }
    if (touch.scrolling.y) {
      touch.scrollTolerance.x = touch.secondaryScrollTolerance;
      if (deltaY > touch.scrollLock && !touch.scrolling.x) touch.enableScrolling.x = NO;
    }
    
    // handle scaling
    if (touch.canScale) {
      var startDistance = touch.startDistance, dd = distance - startDistance;
      if (Math.abs(dd) > touch.scaleTolerance) {
      
        var scale = touch.startScale * (1 + (dd / 100));

        var newScale = this._adjustForEdgeResistance(scale, touch.minimumScale, touch.maximumScale, touch.resistanceCoefficient, touch.resistanceAsymptote);
        this.dragging = YES;
        this._scale = newScale;
        var newPositionInContentX = positionInContentX * this._scale,
            newPositionInContentY = positionInContentY * this._scale;
      }
    }
    
    maxOffsetX = Math.max(0, touch.contentSize.width * this._scale - touch.containerSize.width);
    maxOffsetY = Math.max(0, touch.contentSize.height * this._scale - touch.containerSize.height);
    
    // (offsetY + touchYInFrame) / this._scale = touch.startTouchOffsetInContent.y
    // offsetY + touchYInFrame = touch.startTouchOffsetInContent.y * this._scale;
    // offsetY = touch.startTouchOffset * this._scale - touchYInFrame
    offsetX = touch.startTouchOffsetInContent.x * this._scale - touchXInFrame;
    offsetY = touch.startTouchOffsetInContent.y * this._scale - touchYInFrame;
    
    
    // update immediately, without consulting anyone else.
    this._scroll_verticalScrollOffset = this._adjustForEdgeResistance(offsetY, 0, maxOffsetY, touch.resistanceCoefficient, touch.resistanceAsymptote);
    this._scroll_horizontalScrollOffset = this._adjustForEdgeResistance(offsetX, 0, maxOffsetX, touch.resistanceCoefficient, touch.resistanceAsymptote);
    
    this._applyCSSTransforms(touch.layer);
    
    if (timeStamp - touch.lastEventTime >= 1 || touch.notCalculated) {
      touch.notCalculated = NO;
      var horizontalOffset = this._scroll_horizontalScrollOffset;
      var verticalOffset = this._scroll_verticalScrollOffset;
      
      touch.scrollVelocity.x = ((horizontalOffset - touch.lastScrollOffset.x) / Math.max(1, timeStamp - touch.lastEventTime)); // in px per ms
      touch.scrollVelocity.y = ((verticalOffset - touch.lastScrollOffset.y) / Math.max(1, timeStamp - touch.lastEventTime)); // in px per ms
      touch.lastScrollOffset.x = horizontalOffset;
      touch.lastScrollOffset.y = verticalOffset;
      touch.lastEventTime = timeStamp;
    }
  },

  touchEnd: function(touch) {
    var touchStatus = this.touch,
        avg = touch.averagedTouchesForView(this);
    
    if (avg.touchCount > 0) {
      this.beginTouchTracking(touch, NO);
    } else {
      if (this.dragging) {
        touchStatus.dragging = NO;

        // reset last event time
        touchStatus.lastEventTime = touch.timeStamp;

        this.startDecelerationAnimation();
      } else {
        // trigger touchStart/End on actual target view if possible
        touch.captureTouch(this);
        if (touch.touchResponder && touch.touchResponder !== this) touch.touchResponder.tryToPerform("touchEnd", touch);
      }
    }
  },
  
  touchCancelled: function(touch) {
    this.tracking = NO;
    this.dragging = NO;
    this.touch = null;
  },

  startDecelerationAnimation: function(evt) {
    var touch = this.touch;
    touch.decelerationVelocity = {
      x: touch.scrollVelocity.x * 10,
      y: touch.scrollVelocity.y * 10
    };
    
    this.decelerateAnimation();
  },
  
  /**
    @private
    Does bounce calculations, adjusting velocity.
    
    Bouncing is fun. Functions that handle it should have fun names,
    don'tcha think?
    
    P.S.: should this be named "bouncityBounce" instead?
  */
  bouncyBounce: function(velocity, value, minValue, maxValue, de, ac) {
    if (value < minValue) {
      if (velocity < 0) velocity = velocity + ((minValue - value) * de);
      else velocity = (minValue-value) * ac;
    } else if (value > maxValue) {
      if (velocity > 0) velocity = velocity - ((value - maxValue) * de);
      else velocity = -((value - maxValue) * ac);
    }
    return velocity;
  },

  decelerateAnimation: function() {
    var touch = this.touch,
        scale = this._scale,
        maxOffsetX = Math.max(0, touch.contentSize.width * scale - touch.containerSize.width),
        maxOffsetY = Math.max(0, touch.contentSize.height * scale - touch.containerSize.height),
        newX = this._scroll_horizontalScrollOffset + touch.decelerationVelocity.x,
        newY = this._scroll_verticalScrollOffset + touch.decelerationVelocity.y,
        now = Date.now(),
        t = Math.max(now - touch.lastEventTime, 1);
    
    var de = touch.decelerationFromEdge, ac = touch.accelerationToEdge;

    // update scroll
    this._scroll_horizontalScrollOffset = newX;
    this._scroll_verticalScrollOffset = newY;
    
    
    // handle scale being out-of-range
    var sv = 0;
    sv = this.bouncyBounce(sv, scale, touch.minimumScale, touch.maximumScale, de, ac);
    this._scale = scale = scale + sv;
    
    this._applyCSSTransforms(touch.layer);
    
    // apply decay
    var decay = 0.950;
    touch.decelerationVelocity.y *= Math.pow(decay, (t / 10));
    touch.decelerationVelocity.x *= Math.pow(decay, (t / 10));
    
    // adjust for bouncing
    touch.decelerationVelocity.x = this.bouncyBounce(touch.decelerationVelocity.x, newX, 0, maxOffsetX, de, ac);
    touch.decelerationVelocity.y = this.bouncyBounce(touch.decelerationVelocity.y, newY, 0, maxOffsetY, de, ac);
 
    // if we ain't got no velocity... then we must be finished
    var absXVelocity = Math.abs(touch.decelerationVelocity.x);
    var absYVelocity = Math.abs(touch.decelerationVelocity.y);
    if (absYVelocity < 0.01 && absXVelocity < 0.01 && Math.abs(sv) < 0.01) {
      touch.timeout = null;
      
      SC.RunLoop.begin();
      /*this.set("scale", this._scale);
      this.set("verticalScrollOffset", this._scroll_verticalScrollOffset);
      this.set("horizontalScrollOffset", this._scroll_horizontalScrollOffset);*/
      SC.RunLoop.end();
      return;
    }
    
    // next round
    var self = this;
    touch.lastEventTime = Date.now();
    this.touch.timeout = setTimeout(function(){
      self.decelerateAnimation();
    }, 10);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function() {
    var childViews = [] , view; 
       
    // create the containerView.  We must always have a container view. 
    // also, setup the contentView as the child of the containerView...
    if (SC.none(view = this.containerView)) view = SC.ContainerView;
    
    childViews.push(this.containerView = this.createChildView(view, {
      contentView: this.contentView,
      isScrollContainer: YES
    }));
    
    // and replace our own contentView...
    this.contentView = this.containerView.get('contentView');
    
    // create a horizontal scroller view if needed...
    view = this.horizontalScrollerView;
    if (view) {
      if (this.get('hasHorizontalScroller')) {
        view = this.horizontalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_HORIZONTAL,
          valueBinding: '*owner.horizontalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.horizontalScrollerView = null ;
    }
    
    // create a vertical scroller view if needed...
    view = this.verticalScrollerView;
    if (view) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_VERTICAL,
          valueBinding: '*owner.verticalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.verticalScrollerView = null ;
    }
    
    // set childViews array.
    this.childViews = childViews ;
    
    this.contentViewDidChange() ; // setup initial display...
    this.tile() ; // set up initial tiling
  },
  
  init: function() {
    sc_super();
    
    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call 
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView') ;
    var contentView = this._scroll_contentView ;

    if (contentView) {
      contentView.addObserver('frame', this, this.contentViewFrameDidChange) ;
    }

    if (this.get('isVisibleInWindow')) this._scsv_registerAutoscroll() ;
  },
  
  /** @private Registers/deregisters view with SC.Drag for autoscrolling */
  _scsv_registerAutoscroll: function() {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),
  
  /** @private
    Whenever the contentView is changed, we need to observe the content view's
    frame to be notified whenever it's size changes.
  */
  contentViewDidChange: function() {
    var newView = this.get('contentView'), oldView = this._scroll_contentView;
    var f = this.contentViewFrameDidChange ;
    if (newView !== oldView) {
      
      // stop observing old content view
      if (oldView) oldView.removeObserver('frame', this, f);
      
      // update cache
      this._scroll_contentView = newView;
      if (newView) newView.addObserver('frame', this, f);
      
      // replace container
      this.containerView.set('contentView', newView);
      
      this.contentViewFrameDidChange();
    }
  }.observes('contentView'),

  /** @private
    If we redraw after the initial render, we need to make sure that we reset
    the scrollTop/scrollLeft properties on the content view.  This ensures
    that, for example, the scroll views displays correctly when switching
    views out in a ContainerView.
  */
  render: function(context, firstTime) {
    this.invokeLast(this.adjustElementScroll);
    if (firstTime) {
      context.push('<div class="corner"></div>');
    }
    return sc_super();
  },

  /** @private
    Invoked whenever the contentView's frame changes.  This will update the 
    scroller maxmimum and optionally update the scroller visibility if the
    size of the contentView changes.  We don't care about the origin since
    that is tracked separately from the offset values.
  */

  oldMaxHOffset: 0,
  oldMaxVOffset: 0,

  contentViewFrameDidChange: function() {
    var view   = this.get('contentView'), 
        f      = (view) ? view.get('frame') : null,
        width  = (f) ? f.width : 0,  
        height = (f) ? f.height : 0,
        dim    = this.get('frame'),
        ourFrame = this.get("frame");
    
    // cache out scroll settings...
    //if ((width === this._scroll_contentWidth) && (height === this._scroll_contentHeight)) return ;
    this._scroll_contentWidth = width;
    this._scroll_contentHeight = height ;
    
    if (this.get('hasHorizontalScroller') && (view = this.get('horizontalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesHorizontalScroller')) {
        this.set('isHorizontalScrollerVisible', width > dim.width);
      }
      view.setIfChanged('maximum', width-dim.width) ;
      view.setIfChanged('proportion', dim.width/width);
    }
    
    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.set('isVerticalScrollerVisible', height > dim.height);
      }
      height -= this.get('verticalScrollerBottom') ;
      view.setIfChanged('maximum', height-dim.height) ;
      view.setIfChanged('proportion', dim.height/height);
    }
    
    // If there is no vertical scroller and auto hiding is on, make
    // sure we are at the top if not already there
    if (!this.get('isVerticalScrollerVisible') && (this.get('verticalScrollOffset') !== 0) && 
       this.get('autohidesVerticalScroller')) {
      this.set('verticalScrollOffset', 0);
    }
    
    // Same thing for horizontal scrolling.
    if (!this.get('isHorizontalScrollerVisible') && (this.get('horizontalScrollOffset') !== 0) && 
       this.get('autohidesHorizontalScroller')) {
      this.set('horizontalScrollOffset', 0);
    }
    
    // This forces to recalculate the height of the frame when is at the bottom
    // of the scroll and the content dimension are smaller that the previous one
    
    var mxVOffSet = this.get('maximumVerticalScrollOffset'),
        vOffSet = this.get('verticalScrollOffset'),
        mxHOffSet = this.get('maximumHorizontalScrollOffset'),
        hOffSet = this.get('horizontalScrollOffset');
    var forceHeight = mxVOffSet<vOffSet;
    var forceWidth = mxHOffSet<hOffSet;
    if(forceHeight || forceWidth){
      this.forceDimensionsRecalculation(forceWidth, forceHeight, vOffSet, hOffSet);
    }
  },

  /** @private
    Whenever the horizontal scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_horizontalScrollOffsetDidChange: function() {
    this.invokeLast(this.adjustElementScroll);
  }.observes('horizontalScrollOffset'),
  
  /** @private
    Whenever the vertical scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_verticalScrollOffsetDidChange: function() {
    this.invokeLast(this.adjustElementScroll);
  }.observes('verticalScrollOffset'),
  
  /** @private
    Called at the end of the run loop to actually adjust the scrollTop
    and scrollLeft properties of the container view.
  */
  adjustElementScroll: function() {
    var container = this.get('containerView'),
        content = this.get('contentView'),
        verticalScrollOffset = this.get('verticalScrollOffset'),
        horizontalScrollOffset = this.get('horizontalScrollOffset');

    // We notify the content view that it's frame property has changed
    // before we actually update the scrollTop/scrollLeft properties.
    // This gives views that use incremental rendering a chance to render
    // newly-appearing elements before they come into view.
    if (content) {
      SC.RunLoop.begin();
      content.notifyPropertyChange('frame');
      SC.RunLoop.end();

      // Use accelerated drawing if the browser supports it
      if (SC.browser.touch) {
        this._applyCSSTransforms(content.get('layer'));
      }
    }

    if (container && !SC.browser.touch) {
      container = container.$()[0];
      
      if (container) {
        if (verticalScrollOffset !== this._verticalScrollOffset) {
          container.scrollTop = verticalScrollOffset;
          this._verticalScrollOffset = verticalScrollOffset;
        }

        if (horizontalScrollOffset !== this._horizontalScrollOffset) {
          container.scrollLeft = horizontalScrollOffset;
          this._horizontalScrollOffset = horizontalScrollOffset;
        }
      }
    }
  },

  forceDimensionsRecalculation: function (forceWidth, forceHeight, vOffSet, hOffSet) {
    var oldScrollHOffset = hOffSet;
    var oldScrollVOffset = vOffSet;
    this.scrollTo(0,0);
    if(forceWidth && forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), this.get('maximumVerticalScrollOffset'));
    }
    if(forceWidth && !forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), oldScrollVOffset);
    }
    if(!forceWidth && forceHeight){
      this.scrollTo(oldScrollHOffset ,this.get('maximumVerticalScrollOffset'));
    }
  },

  _verticalScrollOffset: 0,
  _horizontalScrollOffset: 0
  
});
