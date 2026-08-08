var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create2, deps);
        }
        function useInsertionEffect(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create2, deps);
        }
        function useLayoutEffect(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create2, deps);
        }
        function useCallback(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create2, deps);
        }
        function useImperativeHandle(ref, create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create2, deps);
        }
        function useDebugValue2(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module && module[requireString];
              enqueueTaskImpl = nodeRequire.call(module, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports.Children = Children;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports.act = act;
        exports.cloneElement = cloneElement$1;
        exports.createContext = createContext;
        exports.createElement = createElement$1;
        exports.createFactory = createFactory;
        exports.createRef = createRef;
        exports.forwardRef = forwardRef;
        exports.isValidElement = isValidElement;
        exports.lazy = lazy;
        exports.memo = memo;
        exports.startTransition = startTransition;
        exports.unstable_act = act;
        exports.useCallback = useCallback;
        exports.useContext = useContext;
        exports.useDebugValue = useDebugValue2;
        exports.useDeferredValue = useDeferredValue;
        exports.useEffect = useEffect;
        exports.useId = useId;
        exports.useImperativeHandle = useImperativeHandle;
        exports.useInsertionEffect = useInsertionEffect;
        exports.useLayoutEffect = useLayoutEffect;
        exports.useMemo = useMemo;
        exports.useReducer = useReducer;
        exports.useRef = useRef;
        exports.useState = useState;
        exports.useSyncExternalStore = useSyncExternalStore;
        exports.useTransition = useTransition;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    (function() {
      function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
      }
      function useSyncExternalStore$2(subscribe, getSnapshot) {
        didWarnOld18Alpha || void 0 === React.startTransition || (didWarnOld18Alpha = true, console.error(
          "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
        ));
        var value = getSnapshot();
        if (!didWarnUncachedGetSnapshot) {
          var cachedValue = getSnapshot();
          objectIs(value, cachedValue) || (console.error(
            "The result of getSnapshot should be cached to avoid an infinite loop"
          ), didWarnUncachedGetSnapshot = true);
        }
        cachedValue = useState({
          inst: { value, getSnapshot }
        });
        var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
        useLayoutEffect(
          function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          },
          [subscribe, value, getSnapshot]
        );
        useEffect(
          function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            return subscribe(function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            });
          },
          [subscribe]
        );
        useDebugValue2(value);
        return value;
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error) {
          return true;
        }
      }
      function useSyncExternalStore$1(subscribe, getSnapshot) {
        return getSnapshot();
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React = require_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue2 = React.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
      exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
var require_with_selector_development = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js"(exports) {
    "use strict";
    (function() {
      function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React = require_react(), shim = require_shim(), objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue2 = React.useDebugValue;
      exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
        var instRef = useRef(null);
        if (null === instRef.current) {
          var inst = { hasValue: false, value: null };
          instRef.current = inst;
        } else inst = instRef.current;
        instRef = useMemo(
          function() {
            function memoizedSelector(nextSnapshot) {
              if (!hasMemo) {
                hasMemo = true;
                memoizedSnapshot = nextSnapshot;
                nextSnapshot = selector(nextSnapshot);
                if (void 0 !== isEqual && inst.hasValue) {
                  var currentSelection = inst.value;
                  if (isEqual(currentSelection, nextSnapshot))
                    return memoizedSelection = currentSelection;
                }
                return memoizedSelection = nextSnapshot;
              }
              currentSelection = memoizedSelection;
              if (objectIs(memoizedSnapshot, nextSnapshot))
                return currentSelection;
              var nextSelection = selector(nextSnapshot);
              if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
                return memoizedSnapshot = nextSnapshot, currentSelection;
              memoizedSnapshot = nextSnapshot;
              return memoizedSelection = nextSelection;
            }
            var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
            return [
              function() {
                return memoizedSelector(getSnapshot());
              },
              null === maybeGetServerSnapshot ? void 0 : function() {
                return memoizedSelector(maybeGetServerSnapshot());
              }
            ];
          },
          [getSnapshot, getServerSnapshot, selector, isEqual]
        );
        var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
        useEffect(
          function() {
            inst.hasValue = true;
            inst.value = value;
          },
          [value]
        );
        useDebugValue2(value);
        return value;
      };
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = __commonJS({
  "node_modules/use-sync-external-store/shim/with-selector.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_with_selector_development();
    }
  }
});

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api);
  return api;
};
var createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

// node_modules/zustand/esm/index.mjs
var import_react = __toESM(require_react(), 1);
var import_with_selector = __toESM(require_with_selector(), 1);
var { useDebugValue } = import_react.default;
var { useSyncExternalStoreWithSelector } = import_with_selector.default;
var didWarnAboutEqualityFn = false;
var identity = (arg) => arg;
function useStore(api, selector = identity, equalityFn) {
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api = typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
var create = (createState) => createState ? createImpl(createState) : createImpl;

// node_modules/zustand/esm/middleware.mjs
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (_e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, options == null ? void 0 : options.reviver);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(
      name,
      JSON.stringify(newValue, options == null ? void 0 : options.replacer)
    ),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
var toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
var oldImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    getStorage: () => localStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage;
  try {
    storage = options.getStorage();
  } catch (_e) {
  }
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const thenableSerialize = toThenable(options.serialize);
  const setItem = () => {
    const state = options.partialize({ ...get() });
    let errorInSync;
    const thenable = thenableSerialize({ state, version: options.version }).then(
      (serializedValue) => storage.setItem(options.name, serializedValue)
    ).catch((e) => {
      errorInSync = e;
    });
    if (errorInSync) {
      throw errorInSync;
    }
    return thenable;
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  let stateFromStorage;
  const hydrate = () => {
    var _a;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => cb(get()));
    const postRehydrationCallback = ((_a = options.onRehydrateStorage) == null ? void 0 : _a.call(options, get())) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((storageValue) => {
      if (storageValue) {
        return options.deserialize(storageValue);
      }
    }).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return deserializedStorageValue.state;
        }
      }
    }).then((migratedState) => {
      var _a2;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      return setItem();
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.getStorage) {
        storage = newOptions.getStorage();
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  hydrate();
  return stateFromStorage || configResult;
};
var newImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return [
              true,
              options.migrate(
                deserializedStorageValue.state,
                deserializedStorageValue.version
              )
            ];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
var persistImpl = (config, baseOptions) => {
  if ("getStorage" in baseOptions || "serialize" in baseOptions || "deserialize" in baseOptions) {
    if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."
      );
    }
    return oldImpl(config, baseOptions);
  }
  return newImpl(config, baseOptions);
};
var persist = persistImpl;

// src/data/seed.ts
var daysAgo = (n, hour = 10, minute = 0) => {
  const d = new Date(Date.now() - n * 864e5);
  d.setHours(hour, minute, 0, 0);
  return d;
};
var seedTrees = [
  {
    id: "tree-frontend",
    name: "\u524D\u7AEF\u5DE5\u7A0B\u5E08\u6280\u80FD\u6811",
    description: "\u4ECE HTML/CSS/JavaScript \u8D77\u6B65\uFF0C\u5230 React \u751F\u6001\u4E0E\u524D\u7AEF\u67B6\u6784\u7684\u5B8C\u6574\u6210\u957F\u8DEF\u5F84",
    category: "\u524D\u7AEF",
    difficulty: "beginner",
    estimatedDuration: 180,
    tags: ["\u524D\u7AEF", "React", "TypeScript"],
    skills: [
      {
        id: "fe-html",
        name: "HTML \u57FA\u7840",
        description: "\u8BED\u4E49\u5316\u6807\u7B7E\u3001\u8868\u5355\u3001\u5A92\u4F53\u5143\u7D20\u4E0E\u53EF\u8BBF\u95EE\u6027",
        category: "\u524D\u7AEF\u57FA\u7840",
        level: "\u719F\u6089" /* FAMILIAR */,
        status: "completed" /* COMPLETED */,
        xp: 100,
        maxXp: 100,
        prerequisites: [],
        children: ["fe-css"],
        estimatedHours: 20,
        tags: ["HTML", "\u524D\u7AEF"],
        position: { x: 130, y: 480 }
      },
      {
        id: "fe-css",
        name: "CSS \u57FA\u7840",
        description: "\u9009\u62E9\u5668\u3001\u76D2\u6A21\u578B\u3001Flexbox \u4E0E Grid \u5E03\u5C40",
        category: "\u524D\u7AEF\u57FA\u7840",
        level: "\u4F1A\u7528" /* CAPABLE */,
        status: "learning" /* LEARNING */,
        xp: 60,
        maxXp: 100,
        prerequisites: ["fe-html"],
        children: ["fe-js"],
        estimatedHours: 30,
        tags: ["CSS", "\u5E03\u5C40", "\u524D\u7AEF"],
        position: { x: 400, y: 480 }
      },
      {
        id: "fe-js",
        name: "JavaScript \u57FA\u7840",
        description: "\u8BED\u6CD5\u3001DOM \u64CD\u4F5C\u3001\u4E8B\u4EF6\u5FAA\u73AF\u3001ES6+ \u7279\u6027",
        category: "\u524D\u7AEF\u57FA\u7840",
        level: "\u4E86\u89E3" /* AWARE */,
        status: "available" /* AVAILABLE */,
        xp: 20,
        maxXp: 150,
        prerequisites: ["fe-css"],
        children: ["fe-ts", "fe-vue", "fe-git"],
        estimatedHours: 60,
        tags: ["JavaScript", "ES6", "\u524D\u7AEF"],
        position: { x: 670, y: 480 }
      },
      {
        id: "fe-ts",
        name: "TypeScript",
        description: "\u7C7B\u578B\u7CFB\u7EDF\u3001\u63A5\u53E3\u3001\u6CDB\u578B\u4E0E\u5DE5\u7A0B\u5316\u7C7B\u578B\u5B9E\u8DF5",
        category: "\u524D\u7AEF\u8FDB\u9636",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: ["fe-js"],
        children: ["fe-react"],
        estimatedHours: 40,
        tags: ["TypeScript", "\u7C7B\u578B\u7CFB\u7EDF"],
        position: { x: 280, y: 350 }
      },
      {
        id: "fe-react",
        name: "React \u6846\u67B6",
        description: "\u7EC4\u4EF6\u5316\u3001Hooks\u3001\u72B6\u6001\u7BA1\u7406\u4E0E\u8DEF\u7531",
        category: "\u524D\u7AEF\u6846\u67B6",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 200,
        prerequisites: ["fe-js", "fe-ts"],
        children: ["fe-vite", "fe-react-ecosystem"],
        estimatedHours: 80,
        tags: ["React", "Hooks", "\u524D\u7AEF"],
        position: { x: 530, y: 350 }
      },
      {
        id: "fe-vue",
        name: "Vue \u6846\u67B6",
        description: "\u54CD\u5E94\u5F0F\u7CFB\u7EDF\u3001\u7EC4\u5408\u5F0F API \u4E0E\u751F\u6001",
        category: "\u524D\u7AEF\u6846\u67B6",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 160,
        prerequisites: ["fe-js"],
        children: [],
        estimatedHours: 60,
        tags: ["Vue", "\u524D\u7AEF"],
        position: { x: 740, y: 350 }
      },
      {
        id: "fe-git",
        name: "Git \u4E0E\u534F\u4F5C",
        description: "\u7248\u672C\u7BA1\u7406\u3001\u5206\u652F\u7B56\u7565\u3001Code Review \u6D41\u7A0B",
        category: "\u5DE5\u7A0B\u5316",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 80,
        prerequisites: ["fe-js"],
        children: [],
        estimatedHours: 15,
        tags: ["Git", "\u534F\u4F5C", "\u5DE5\u7A0B\u5316"],
        position: { x: 140, y: 220 }
      },
      {
        id: "fe-vite",
        name: "Vite \u5DE5\u7A0B\u5316",
        description: "\u6784\u5EFA\u5DE5\u5177\u3001\u5F00\u53D1\u670D\u52A1\u5668\u3001\u6253\u5305\u4F18\u5316\u4E0E\u53D1\u5E03",
        category: "\u5DE5\u7A0B\u5316",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: ["fe-react"],
        children: ["fe-perf"],
        estimatedHours: 30,
        tags: ["Vite", "\u5DE5\u7A0B\u5316", "\u6784\u5EFA"],
        position: { x: 450, y: 220 }
      },
      {
        id: "fe-react-ecosystem",
        name: "React \u751F\u6001\u8FDB\u9636",
        description: "Next.js\u3001\u72B6\u6001\u7BA1\u7406\u5E93\u3001\u6D4B\u8BD5\u4E0E SSR",
        category: "\u524D\u7AEF\u8FDB\u9636",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 200,
        prerequisites: ["fe-react"],
        children: ["fe-perf"],
        estimatedHours: 70,
        tags: ["Next.js", "Redux", "\u6D4B\u8BD5", "\u524D\u7AEF"],
        position: { x: 720, y: 220 }
      },
      {
        id: "fe-perf",
        name: "\u524D\u7AEF\u6027\u80FD\u4F18\u5316",
        description: "\u6E32\u67D3\u6027\u80FD\u3001\u7F51\u7EDC\u4F18\u5316\u3001\u6027\u80FD\u76D1\u63A7\u4E0E\u6307\u6807",
        category: "\u524D\u7AEF\u9AD8\u7EA7",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 150,
        prerequisites: ["fe-vite", "fe-react-ecosystem"],
        children: ["fe-arch"],
        estimatedHours: 40,
        tags: ["\u6027\u80FD", "\u4F18\u5316", "\u524D\u7AEF"],
        position: { x: 380, y: 90 }
      },
      {
        id: "fe-arch",
        name: "\u524D\u7AEF\u67B6\u6784\u8BBE\u8BA1",
        description: "\u5FAE\u524D\u7AEF\u3001\u8BBE\u8BA1\u7CFB\u7EDF\u3001\u5DE5\u7A0B\u89C4\u8303\u4E0E\u56E2\u961F\u6548\u80FD",
        category: "\u524D\u7AEF\u9AD8\u7EA7",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 200,
        prerequisites: ["fe-perf"],
        children: [],
        estimatedHours: 50,
        tags: ["\u67B6\u6784", "\u8BBE\u8BA1\u7CFB\u7EDF", "\u524D\u7AEF"],
        position: { x: 620, y: 90 }
      }
    ]
  },
  {
    id: "tree-backend",
    name: "\u540E\u7AEF\u5DE5\u7A0B\u5E08\u6280\u80FD\u6811",
    description: "Node.js \u670D\u52A1\u7AEF\u5F00\u53D1\u3001\u6570\u636E\u5E93\u4E0E\u7CFB\u7EDF\u8BBE\u8BA1\u7684\u6210\u957F\u8DEF\u5F84",
    category: "\u540E\u7AEF",
    difficulty: "intermediate",
    estimatedDuration: 150,
    tags: ["\u540E\u7AEF", "Node.js", "\u6570\u636E\u5E93"],
    skills: [
      {
        id: "be-node",
        name: "Node.js \u57FA\u7840",
        description: "\u4E8B\u4EF6\u5FAA\u73AF\u3001\u6A21\u5757\u7CFB\u7EDF\u3001\u5F02\u6B65\u7F16\u7A0B\u4E0E\u5185\u7F6E\u6A21\u5757",
        category: "\u540E\u7AEF\u57FA\u7840",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: [],
        children: ["be-express"],
        estimatedHours: 40,
        tags: ["Node.js", "\u540E\u7AEF"],
        position: { x: 250, y: 480 }
      },
      {
        id: "be-sql",
        name: "\u6570\u636E\u5E93\u4E0E SQL",
        description: "\u5173\u7CFB\u6A21\u578B\u3001\u67E5\u8BE2\u4F18\u5316\u3001\u4E8B\u52A1\u4E0E\u7D22\u5F15",
        category: "\u540E\u7AEF\u57FA\u7840",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: [],
        children: ["be-db-design"],
        estimatedHours: 40,
        tags: ["SQL", "\u6570\u636E\u5E93", "\u540E\u7AEF"],
        position: { x: 550, y: 480 }
      },
      {
        id: "be-express",
        name: "Express \u6846\u67B6",
        description: "\u4E2D\u95F4\u4EF6\u3001\u8DEF\u7531\u3001\u9519\u8BEF\u5904\u7406\u4E0E REST \u5B9E\u8DF5",
        category: "\u540E\u7AEF\u6846\u67B6",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: ["be-node"],
        children: ["be-restful"],
        estimatedHours: 30,
        tags: ["Express", "Node.js", "\u540E\u7AEF"],
        position: { x: 250, y: 350 }
      },
      {
        id: "be-db-design",
        name: "\u6570\u636E\u5E93\u8BBE\u8BA1",
        description: "\u8303\u5F0F\u3001ER \u5EFA\u6A21\u3001\u5206\u5E93\u5206\u8868\u4E0E\u6570\u636E\u4E00\u81F4\u6027",
        category: "\u540E\u7AEF\u8FDB\u9636",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 150,
        prerequisites: ["be-sql"],
        children: ["be-restful", "be-redis"],
        estimatedHours: 35,
        tags: ["\u6570\u636E\u5E93", "\u5EFA\u6A21", "\u540E\u7AEF"],
        position: { x: 550, y: 350 }
      },
      {
        id: "be-restful",
        name: "RESTful API \u8BBE\u8BA1",
        description: "\u8D44\u6E90\u5EFA\u6A21\u3001\u7248\u672C\u7BA1\u7406\u3001\u9274\u6743\u4E0E API \u6587\u6863",
        category: "\u540E\u7AEF\u8FDB\u9636",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: ["be-express", "be-db-design"],
        children: ["be-sysdesign"],
        estimatedHours: 30,
        tags: ["REST", "API", "\u540E\u7AEF"],
        position: { x: 250, y: 220 }
      },
      {
        id: "be-redis",
        name: "Redis \u4E0E\u7F13\u5B58",
        description: "\u7F13\u5B58\u7B56\u7565\u3001\u6301\u4E45\u5316\u3001\u5206\u5E03\u5F0F\u9501\u4E0E\u6027\u80FD\u8C03\u4F18",
        category: "\u540E\u7AEF\u8FDB\u9636",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 100,
        prerequisites: ["be-db-design"],
        children: ["be-sysdesign"],
        estimatedHours: 25,
        tags: ["Redis", "\u7F13\u5B58", "\u540E\u7AEF"],
        position: { x: 550, y: 220 }
      },
      {
        id: "be-sysdesign",
        name: "\u7CFB\u7EDF\u8BBE\u8BA1",
        description: "\u9AD8\u5E76\u53D1\u67B6\u6784\u3001\u5FAE\u670D\u52A1\u3001\u6D88\u606F\u961F\u5217\u4E0E\u53EF\u89C2\u6D4B\u6027",
        category: "\u540E\u7AEF\u9AD8\u7EA7",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 200,
        prerequisites: ["be-restful", "be-redis"],
        children: [],
        estimatedHours: 60,
        tags: ["\u67B6\u6784", "\u5FAE\u670D\u52A1", "\u540E\u7AEF"],
        position: { x: 400, y: 90 }
      }
    ]
  },
  {
    id: "tree-design",
    name: "UI/UX \u8BBE\u8BA1\u5E08\u6280\u80FD\u6811",
    description: "\u4ECE\u8BBE\u8BA1\u57FA\u7840\u5230\u8BBE\u8BA1\u7CFB\u7EDF\u7684\u5B8C\u6574\u6210\u957F\u8DEF\u5F84",
    category: "\u8BBE\u8BA1",
    difficulty: "beginner",
    estimatedDuration: 90,
    tags: ["\u8BBE\u8BA1", "UI", "UX"],
    skills: [
      {
        id: "ds-basic",
        name: "\u8BBE\u8BA1\u57FA\u7840",
        description: "\u8BBE\u8BA1\u539F\u5219\u3001\u6784\u56FE\u3001\u89C6\u89C9\u5C42\u7EA7\u4E0E\u5BA1\u7F8E\u8BAD\u7EC3",
        category: "\u8BBE\u8BA1\u57FA\u7840",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 80,
        prerequisites: [],
        children: ["ds-ui", "ds-ux"],
        estimatedHours: 20,
        tags: ["\u8BBE\u8BA1", "\u57FA\u7840"],
        position: { x: 180, y: 480 }
      },
      {
        id: "ds-color",
        name: "\u8272\u5F69\u7406\u8BBA",
        description: "\u8272\u5F69\u6A21\u578B\u3001\u914D\u8272\u65B9\u6848\u4E0E\u54C1\u724C\u8272\u4F53\u7CFB",
        category: "\u8BBE\u8BA1\u57FA\u7840",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 60,
        prerequisites: [],
        children: ["ds-ui"],
        estimatedHours: 15,
        tags: ["\u8272\u5F69", "\u8BBE\u8BA1"],
        position: { x: 400, y: 480 }
      },
      {
        id: "ds-type",
        name: "\u6392\u7248\u4E0E\u5B57\u4F53",
        description: "\u5B57\u4F53\u9009\u62E9\u3001\u5B57\u53F7\u9636\u68AF\u3001\u884C\u9AD8\u4E0E\u4FE1\u606F\u5C42\u7EA7",
        category: "\u8BBE\u8BA1\u57FA\u7840",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 60,
        prerequisites: [],
        children: ["ds-ui"],
        estimatedHours: 15,
        tags: ["\u6392\u7248", "\u5B57\u4F53", "\u8BBE\u8BA1"],
        position: { x: 620, y: 480 }
      },
      {
        id: "ds-ui",
        name: "UI \u7EC4\u4EF6\u8BBE\u8BA1",
        description: "\u6309\u94AE\u3001\u8868\u5355\u3001\u5BFC\u822A\u7B49\u7EC4\u4EF6\u7684\u89C4\u8303\u8BBE\u8BA1",
        category: "\u754C\u9762\u8BBE\u8BA1",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: ["ds-basic", "ds-color", "ds-type"],
        children: ["ds-system"],
        estimatedHours: 30,
        tags: ["UI", "\u7EC4\u4EF6", "\u8BBE\u8BA1"],
        position: { x: 300, y: 320 }
      },
      {
        id: "ds-ux",
        name: "\u4EA4\u4E92\u8BBE\u8BA1",
        description: "\u7528\u6237\u6D41\u7A0B\u3001\u7EBF\u6846\u56FE\u3001\u53EF\u7528\u6027\u4E0E\u539F\u578B",
        category: "\u4F53\u9A8C\u8BBE\u8BA1",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 120,
        prerequisites: ["ds-basic"],
        children: ["ds-system"],
        estimatedHours: 30,
        tags: ["UX", "\u4EA4\u4E92", "\u539F\u578B"],
        position: { x: 600, y: 320 }
      },
      {
        id: "ds-system",
        name: "\u8BBE\u8BA1\u7CFB\u7EDF",
        description: "\u8BBE\u8BA1\u4EE4\u724C\u3001\u7EC4\u4EF6\u5E93\u3001\u6587\u6863\u4E0E\u591A\u7AEF\u9002\u914D",
        category: "\u8BBE\u8BA1\u9AD8\u7EA7",
        level: "\u8BA4\u8BC6" /* UNKNOWN */,
        status: "locked" /* LOCKED */,
        xp: 0,
        maxXp: 150,
        prerequisites: ["ds-ui", "ds-ux"],
        children: [],
        estimatedHours: 40,
        tags: ["\u8BBE\u8BA1\u7CFB\u7EDF", "\u89C4\u8303", "\u8BBE\u8BA1"],
        position: { x: 450, y: 160 }
      }
    ]
  }
];
var seedTasks = [
  {
    id: "task-html-practice",
    title: "\u5B8C\u6210 HTML \u8BED\u4E49\u5316\u7EC3\u4E60",
    description: "\u7528\u8BED\u4E49\u5316\u6807\u7B7E\u91CD\u6784\u4E00\u4E2A\u535A\u5BA2\u9875\u9762\uFF0C\u5E76\u901A\u8FC7 W3C \u6821\u9A8C",
    skillId: "fe-html",
    status: "completed",
    priority: "medium",
    estimatedMinutes: 60,
    actualMinutes: 50,
    dueDate: daysAgo(3),
    tags: ["HTML", "\u7EC3\u4E60"],
    subtasks: [
      { id: "t-html-1", title: "\u68B3\u7406\u9875\u9762\u7ED3\u6784\uFF0C\u786E\u5B9A\u8BED\u4E49\u5316\u6807\u7B7E", completed: true, estimatedMinutes: 15 },
      { id: "t-html-2", title: "\u91CD\u6784\u9875\u9762\u5E76\u5904\u7406\u8868\u5355\u4E0E\u5A92\u4F53\u5143\u7D20", completed: true, estimatedMinutes: 30 },
      { id: "t-html-3", title: "\u901A\u8FC7 W3C \u6821\u9A8C\u5E76\u4FEE\u590D\u95EE\u9898", completed: true, estimatedMinutes: 15 }
    ],
    aiGenerated: false
  },
  {
    id: "task-css-layout",
    title: "CSS Flexbox \u4E0E Grid \u5E03\u5C40\u5B9E\u6218",
    description: "\u7528 Flexbox \u548C Grid \u5206\u522B\u5B9E\u73B0\u7ECF\u5178\u9875\u9762\u5E03\u5C40\u5E76\u5BF9\u6BD4\u4F18\u52A3",
    skillId: "fe-css",
    status: "in-progress",
    priority: "high",
    estimatedMinutes: 90,
    actualMinutes: 40,
    dueDate: daysAgo(1),
    tags: ["CSS", "\u5E03\u5C40", "\u7EC3\u4E60"],
    subtasks: [
      { id: "t-css-1", title: "Flexbox \u5B9E\u73B0\u5BFC\u822A\u680F\u4E0E\u5361\u7247\u5E03\u5C40", completed: true, estimatedMinutes: 30 },
      { id: "t-css-2", title: "Grid \u5B9E\u73B0\u54CD\u5E94\u5F0F\u9875\u9762\u9AA8\u67B6", completed: false, estimatedMinutes: 30 },
      { id: "t-css-3", title: "\u603B\u7ED3\u4E24\u79CD\u5E03\u5C40\u7684\u9002\u7528\u573A\u666F", completed: false, estimatedMinutes: 30 }
    ],
    aiGenerated: false
  },
  {
    id: "task-js-basics",
    title: "JavaScript \u57FA\u7840\u8BED\u6CD5\u7EC3\u4E60",
    description: "\u6570\u7EC4\u65B9\u6CD5\u3001\u5BF9\u8C61\u64CD\u4F5C\u3001\u95ED\u5305\u4E0E\u5F02\u6B65\u7F16\u7A0B\u4E13\u9879\u7EC3\u4E60",
    skillId: "fe-js",
    status: "todo",
    priority: "high",
    estimatedMinutes: 120,
    dueDate: daysAgo(0, 18),
    tags: ["JavaScript", "\u7EC3\u4E60"],
    subtasks: [
      { id: "t-js-1", title: "\u6570\u7EC4\u4E0E\u5BF9\u8C61\u65B9\u6CD5\u7EC3\u4E60\uFF08map/filter/reduce\uFF09", completed: false, estimatedMinutes: 40 },
      { id: "t-js-2", title: "\u95ED\u5305\u4E0E\u4F5C\u7528\u57DF\u7406\u89E3\u7EC3\u4E60", completed: false, estimatedMinutes: 30 },
      { id: "t-js-3", title: "Promise \u4E0E async/await \u5B9E\u6218", completed: false, estimatedMinutes: 50 }
    ],
    aiGenerated: false
  },
  {
    id: "task-ts-docs",
    title: "TypeScript \u5B98\u65B9\u6587\u6863\u7CBE\u8BFB",
    description: "AI \u63A8\u8350\uFF1A\u638C\u63E1\u7C7B\u578B\u7CFB\u7EDF\u662F\u5B66\u4E60 React \u7684\u524D\u7F6E\u6761\u4EF6",
    skillId: "fe-ts",
    status: "todo",
    priority: "medium",
    estimatedMinutes: 90,
    dueDate: daysAgo(0, 20),
    tags: ["TypeScript", "\u6587\u6863", "AI\u63A8\u8350"],
    subtasks: [
      { id: "t-ts-1", title: "\u7C7B\u578B\u7CFB\u7EDF\u4E0E\u57FA\u7840\u7C7B\u578B", completed: false, estimatedMinutes: 30 },
      { id: "t-ts-2", title: "\u63A5\u53E3\u3001\u7C7B\u578B\u522B\u540D\u4E0E\u6CDB\u578B", completed: false, estimatedMinutes: 30 },
      { id: "t-ts-3", title: "\u7C7B\u578B\u6536\u7A84\u4E0E\u5DE5\u5177\u7C7B\u578B", completed: false, estimatedMinutes: 30 }
    ],
    aiGenerated: true
  },
  {
    id: "task-react-components",
    title: "React \u7EC4\u4EF6\u5F00\u53D1\u5B9E\u6218",
    description: "\u7528\u51FD\u6570\u7EC4\u4EF6 + Hooks \u5B9E\u73B0\u4E00\u4E2A TodoList \u5E94\u7528",
    skillId: "fe-react",
    status: "in-progress",
    priority: "high",
    estimatedMinutes: 120,
    actualMinutes: 45,
    dueDate: daysAgo(0, 15),
    tags: ["React", "Hooks", "\u9879\u76EE"],
    subtasks: [
      { id: "t-react-1", title: "\u642D\u5EFA\u7EC4\u4EF6\u7ED3\u6784\uFF08\u5217\u8868/\u8F93\u5165/\u7B5B\u9009\uFF09", completed: true, estimatedMinutes: 30 },
      { id: "t-react-2", title: "\u7528 useState \u7BA1\u7406\u4EFB\u52A1\u72B6\u6001", completed: false, estimatedMinutes: 40 },
      { id: "t-react-3", title: "\u7528 useEffect \u5B9E\u73B0\u672C\u5730\u6301\u4E45\u5316", completed: false, estimatedMinutes: 50 }
    ],
    aiGenerated: true
  },
  {
    id: "task-git-basics",
    title: "Git \u5E38\u7528\u547D\u4EE4\u5B9E\u6218",
    description: "\u5206\u652F\u7BA1\u7406\u3001\u51B2\u7A81\u89E3\u51B3\u4E0E Rebase \u6D41\u7A0B\u7EC3\u4E60",
    skillId: "fe-git",
    status: "todo",
    priority: "medium",
    estimatedMinutes: 60,
    dueDate: daysAgo(0, 22),
    tags: ["Git", "\u7EC3\u4E60"],
    subtasks: [
      { id: "t-git-1", title: "\u5206\u652F\u521B\u5EFA\u3001\u5408\u5E76\u4E0E\u5220\u9664", completed: false, estimatedMinutes: 20 },
      { id: "t-git-2", title: "\u6A21\u62DF\u51B2\u7A81\u5E76\u624B\u52A8\u89E3\u51B3", completed: false, estimatedMinutes: 25 },
      { id: "t-git-3", title: "Rebase \u4E0E Cherry-pick \u5B9E\u8DF5", completed: false, estimatedMinutes: 15 }
    ],
    aiGenerated: false
  }
];
var seedCircles = [
  {
    id: "circle-frontend",
    name: "\u524D\u7AEF\u5F00\u53D1\u5B66\u4E60\u5708",
    description: "\u4E13\u6CE8\u524D\u7AEF\u6280\u672F\u5B66\u4E60\u4E0E\u5206\u4EAB\uFF0C\u8986\u76D6 React\u3001Vue\u3001TypeScript \u4E0E\u5DE5\u7A0B\u5316\u5B9E\u8DF5",
    category: "\u6280\u672F\u5B66\u4E60",
    tags: ["\u524D\u7AEF", "React", "Vue", "JavaScript"],
    memberCount: 1250,
    skillTags: ["React", "Vue", "TypeScript", "JavaScript", "CSS"],
    posts: [],
    isPrivate: false,
    createdAt: daysAgo(200)
  },
  {
    id: "circle-ts",
    name: "TypeScript \u5B9E\u6218",
    description: "\u6DF1\u5165\u5B66\u4E60 TypeScript \u7C7B\u578B\u7CFB\u7EDF\uFF0C\u5206\u4EAB\u6700\u4F73\u5B9E\u8DF5\u4E0E\u9879\u76EE\u7ECF\u9A8C",
    category: "\u7F16\u7A0B\u8BED\u8A00",
    tags: ["TypeScript", "\u7C7B\u578B\u7CFB\u7EDF", "\u6CDB\u578B"],
    memberCount: 680,
    skillTags: ["TypeScript", "JavaScript"],
    posts: [],
    isPrivate: false,
    createdAt: daysAgo(150)
  },
  {
    id: "circle-ai",
    name: "AI \u6280\u672F\u63A2\u7D22",
    description: "\u63A2\u8BA8\u4EBA\u5DE5\u667A\u80FD\u6280\u672F\u53D1\u5C55\uFF0C\u5206\u4EAB AI \u5E94\u7528\u6848\u4F8B\u4E0E\u5B66\u4E60\u8D44\u6E90",
    category: "\u65B0\u5174\u6280\u672F",
    tags: ["AI", "\u673A\u5668\u5B66\u4E60", "\u5927\u6A21\u578B"],
    memberCount: 950,
    skillTags: ["AI", "Python", "\u673A\u5668\u5B66\u4E60"],
    posts: [],
    isPrivate: false,
    createdAt: daysAgo(120)
  },
  {
    id: "circle-fullstack",
    name: "\u5168\u6808\u5F00\u53D1\u4E4B\u8DEF",
    description: "\u4ECE\u524D\u7AEF\u5230\u540E\u7AEF\uFF0C\u5206\u4EAB\u5168\u6808\u5F00\u53D1\u6280\u80FD\u4E0E\u5B8C\u6574\u9879\u76EE\u5B9E\u6218\u7ECF\u9A8C",
    category: "\u6280\u672F\u5B66\u4E60",
    tags: ["\u5168\u6808", "Node.js", "\u6570\u636E\u5E93"],
    memberCount: 1560,
    skillTags: ["Node.js", "React", "\u6570\u636E\u5E93", "Express", "JavaScript", "\u524D\u7AEF"],
    posts: [],
    isPrivate: false,
    createdAt: daysAgo(180)
  },
  {
    id: "circle-python",
    name: "Python \u6570\u636E\u79D1\u5B66",
    description: "\u6570\u636E\u5206\u6790\u3001\u53EF\u89C6\u5316\u4E0E\u673A\u5668\u5B66\u4E60\u5165\u95E8\uFF0C\u9002\u5408\u96F6\u57FA\u7840\u5B66\u4E60\u8005",
    category: "\u6570\u636E\u79D1\u5B66",
    tags: ["Python", "\u6570\u636E\u5206\u6790", "\u673A\u5668\u5B66\u4E60"],
    memberCount: 2300,
    skillTags: ["Python", "\u6570\u636E\u5206\u6790", "\u673A\u5668\u5B66\u4E60"],
    posts: [],
    isPrivate: false,
    createdAt: daysAgo(160)
  },
  {
    id: "circle-node",
    name: "Node.js \u540E\u7AEF\u5F00\u53D1",
    description: "\u670D\u52A1\u7AEF JavaScript \u5F00\u53D1\uFF0C\u4ECE Express \u5230\u5FAE\u670D\u52A1\u67B6\u6784",
    category: "\u540E\u7AEF\u5F00\u53D1",
    tags: ["Node.js", "Express", "\u5FAE\u670D\u52A1"],
    memberCount: 890,
    skillTags: ["Node.js", "Express", "\u6570\u636E\u5E93"],
    posts: [],
    isPrivate: false,
    createdAt: daysAgo(140)
  }
];
var seedNotes = [
  {
    id: "note-react-hooks",
    content: "\u4ECA\u5929\u5B66\u4E60\u4E86 React Hooks\uFF0CuseState \u7684\u4F7F\u7528\u6BD4\u60F3\u8C61\u4E2D\u7B80\u5355\uFF0C\u4F46 useEffect \u7684\u4F9D\u8D56\u6570\u7EC4\u9700\u8981\u7279\u522B\u6CE8\u610F\u3002\u8BB0\u5F55\u4E00\u4E0B\u9047\u5230\u7684\u65E0\u9650\u5FAA\u73AF\u95EE\u9898\uFF1A\u4F9D\u8D56\u6570\u7EC4\u91CC\u653E\u4E86\u5BF9\u8C61\u5B57\u9762\u91CF\u5BFC\u81F4\u6BCF\u6B21\u6E32\u67D3\u90FD\u91CD\u65B0\u6267\u884C\uFF0C\u89E3\u6CD5\u662F\u63D0\u53D6\u5230 useMemo \u6216\u62C6\u5206\u4F9D\u8D56\u3002",
    skillTags: ["React", "Hooks", "useEffect"],
    taskId: "task-react-components",
    mood: "happy",
    visibility: "public",
    createdAt: daysAgo(2, 14, 30),
    updatedAt: daysAgo(2, 14, 30)
  },
  {
    id: "note-ts-inference",
    content: "TypeScript \u7684\u7C7B\u578B\u63A8\u65AD\u771F\u7684\u5F88\u5F3A\u5927\uFF01\u4ECA\u5929\u5199\u9879\u76EE\u65F6\u53D1\u73B0\u7F16\u8BD1\u5668\u80FD\u81EA\u52A8\u63A8\u65AD\u51FA\u5F88\u591A\u7C7B\u578B\uFF0C\u4EE3\u7801\u53D8\u5F97\u66F4\u52A0\u5B89\u5168\u3002\u6CDB\u578B\u7EA6\u675F <T extends ...> \u7684\u5199\u6CD5\u8BA9\u51FD\u6570\u65E2\u7075\u6D3B\u53C8\u5B89\u5168\uFF0C\u8FD9\u5C31\u662F\u7C7B\u578B\u4F53\u64CD\u7684\u9B45\u529B\u3002",
    skillTags: ["TypeScript", "\u7C7B\u578B\u7CFB\u7EDF"],
    mood: "excited",
    visibility: "circle",
    createdAt: daysAgo(4, 9, 15),
    updatedAt: daysAgo(4, 9, 15)
  },
  {
    id: "note-css-layout",
    content: "\u9047\u5230\u4E86 CSS \u5E03\u5C40\u95EE\u9898\uFF0Cflexbox \u548C grid \u5404\u6709\u4F18\u52BF\u3002\u6574\u7406\u4E86\u4E00\u4E0B\u4F7F\u7528\u573A\u666F\uFF1A\u4E00\u7EF4\u5E03\u5C40\uFF08\u5BFC\u822A\u3001\u5361\u7247\u5217\u8868\uFF09\u7528 flex\uFF0C\u4E8C\u7EF4\u5E03\u5C40\uFF08\u9875\u9762\u9AA8\u67B6\u3001\u590D\u6742\u7F51\u683C\uFF09\u7528 grid\u3002grid \u7684 gap \u548C fr \u5355\u4F4D\u5728\u54CD\u5E94\u5F0F\u91CC\u975E\u5E38\u597D\u7528\u3002",
    skillTags: ["CSS", "Flexbox", "Grid"],
    mood: "neutral",
    visibility: "private",
    createdAt: daysAgo(6, 16, 45),
    updatedAt: daysAgo(6, 16, 45)
  },
  {
    id: "note-js-eventloop",
    content: "\u4E8B\u4EF6\u5FAA\u73AF\u7684\u5751\uFF1AsetTimeout(0) \u4E0D\u4E00\u5B9A\u662F 0ms\uFF0C\u5B8F\u4EFB\u52A1\u548C\u5FAE\u4EFB\u52A1\u7684\u6267\u884C\u987A\u5E8F\u8981\u7262\u8BB0\u3002\u5FAE\u4EFB\u52A1\uFF08Promise.then\uFF09\u5728\u5F53\u524D\u5B8F\u4EFB\u52A1\u7ED3\u675F\u540E\u7ACB\u5373\u6267\u884C\uFF0C\u800C\u6E32\u67D3\u53D1\u751F\u5728\u5FAE\u4EFB\u52A1\u4E4B\u540E\u3002\u7406\u89E3\u4E86\u8FD9\u4E2A\u6A21\u578B\uFF0C\u5F02\u6B65 bug \u57FA\u672C\u90FD\u80FD\u5B9A\u4F4D\u3002",
    skillTags: ["JavaScript", "\u4E8B\u4EF6\u5FAA\u73AF"],
    mood: "confused",
    visibility: "public",
    createdAt: daysAgo(8, 20, 10),
    updatedAt: daysAgo(8, 20, 10)
  }
];
var seedAchievements = [
  // 学习类
  {
    id: "ach-first-task",
    name: "\u521D\u51FA\u8305\u5E90",
    description: "\u5B8C\u6210\u7B2C\u4E00\u4E2A\u5B66\u4E60\u4EFB\u52A1",
    icon: "\u{1F3AF}",
    type: "learning",
    condition: "\u5B8C\u6210\u4EFB\u52A1\u6570 \u2265 1",
    progressType: "completedTasks",
    progressTarget: 1,
    unlockedAt: daysAgo(3),
    xpReward: 50
  },
  {
    id: "ach-task-master",
    name: "\u4EFB\u52A1\u8FBE\u4EBA",
    description: "\u7D2F\u8BA1\u5B8C\u6210 10 \u4E2A\u5B66\u4E60\u4EFB\u52A1",
    icon: "\u2705",
    type: "learning",
    condition: "\u5B8C\u6210\u4EFB\u52A1\u6570 \u2265 10",
    progressType: "completedTasks",
    progressTarget: 10,
    xpReward: 100
  },
  {
    id: "ach-task-legend",
    name: "\u4EFB\u52A1\u72C2\u4EBA",
    description: "\u7D2F\u8BA1\u5B8C\u6210 30 \u4E2A\u5B66\u4E60\u4EFB\u52A1",
    icon: "\u{1F4AA}",
    type: "learning",
    condition: "\u5B8C\u6210\u4EFB\u52A1\u6570 \u2265 30",
    progressType: "completedTasks",
    progressTarget: 30,
    xpReward: 200
  },
  {
    id: "ach-xp-1000",
    name: "\u7ECF\u9A8C\u79EF\u7D2F",
    description: "\u7D2F\u8BA1\u83B7\u5F97 1000 \u7ECF\u9A8C\u503C",
    icon: "\u26A1",
    type: "learning",
    condition: "\u603B\u7ECF\u9A8C\u503C \u2265 1000",
    progressType: "totalXp",
    progressTarget: 1e3,
    unlockedAt: daysAgo(5),
    xpReward: 100
  },
  {
    id: "ach-xp-5000",
    name: "\u7ECF\u9A8C\u5BCC\u8C6A",
    description: "\u7D2F\u8BA1\u83B7\u5F97 5000 \u7ECF\u9A8C\u503C",
    icon: "\u{1F48E}",
    type: "learning",
    condition: "\u603B\u7ECF\u9A8C\u503C \u2265 5000",
    progressType: "totalXp",
    progressTarget: 5e3,
    xpReward: 300
  },
  {
    id: "ach-lv5",
    name: "\u7B49\u7EA7\u7CBE\u82F1",
    description: "\u7B49\u7EA7\u8FBE\u5230 Lv.5",
    icon: "\u{1F680}",
    type: "milestone",
    condition: "\u7B49\u7EA7 \u2265 Lv.5",
    progressType: "level",
    progressTarget: 5,
    xpReward: 200
  },
  // 技能类
  {
    id: "ach-skill-master",
    name: "\u6280\u80FD\u5927\u5E08",
    description: "\u638C\u63E1 5 \u4E2A\u6280\u80FD\u8282\u70B9",
    icon: "\u{1F3C6}",
    type: "skill",
    condition: "\u638C\u63E1\u6280\u80FD\u6570 \u2265 5",
    progressType: "masteredSkills",
    progressTarget: 5,
    xpReward: 150
  },
  {
    id: "ach-skill-10",
    name: "\u5341\u9879\u5168\u80FD",
    description: "\u638C\u63E1 10 \u4E2A\u6280\u80FD\u8282\u70B9",
    icon: "\u2B50",
    type: "skill",
    condition: "\u638C\u63E1\u6280\u80FD\u6570 \u2265 10",
    progressType: "masteredSkills",
    progressTarget: 10,
    xpReward: 300
  },
  {
    id: "ach-fullstack",
    name: "\u5168\u6808\u4E4B\u8DEF",
    description: "\u524D\u7AEF\u4E0E\u540E\u7AEF\u5404\u638C\u63E1 1 \u4E2A\u6280\u80FD",
    icon: "\u{1F310}",
    type: "skill",
    condition: "\u524D\u7AEF\u3001\u540E\u7AEF\u5404\u638C\u63E1 1 \u4E2A\u6280\u80FD",
    xpReward: 200
  },
  // 连续类
  {
    id: "ach-streak",
    name: "\u575A\u6301\u4E0D\u61C8",
    description: "\u8FDE\u7EED\u5B66\u4E60 3 \u5929",
    icon: "\u{1F525}",
    type: "streak",
    condition: "\u8FDE\u7EED\u5B66\u4E60\u5929\u6570 \u2265 3",
    progressType: "currentStreak",
    progressTarget: 3,
    unlockedAt: daysAgo(2),
    xpReward: 80
  },
  {
    id: "ach-streak-7",
    name: "\u4E00\u5468\u4E4B\u7EA6",
    description: "\u8FDE\u7EED\u5B66\u4E60 7 \u5929",
    icon: "\u{1F4C5}",
    type: "streak",
    condition: "\u8FDE\u7EED\u5B66\u4E60\u5929\u6570 \u2265 7",
    progressType: "currentStreak",
    progressTarget: 7,
    xpReward: 200
  },
  // 创作类
  {
    id: "ach-note-writer",
    name: "\u7B14\u8BB0\u8FBE\u4EBA",
    description: "\u521B\u5EFA 5 \u6761\u5B66\u4E60\u7B14\u8BB0",
    icon: "\u{1F4DD}",
    type: "creation",
    condition: "\u7B14\u8BB0\u6570 \u2265 5",
    progressType: "notes",
    progressTarget: 5,
    xpReward: 60
  },
  {
    id: "ach-note-20",
    name: "\u5199\u4F5C\u5927\u5E08",
    description: "\u521B\u5EFA 20 \u6761\u5B66\u4E60\u7B14\u8BB0",
    icon: "\u270D\uFE0F",
    type: "creation",
    condition: "\u7B14\u8BB0\u6570 \u2265 20",
    progressType: "notes",
    progressTarget: 20,
    xpReward: 200
  },
  {
    id: "ach-like-50",
    name: "\u70B9\u8D5E\u6536\u5272",
    description: "\u7B14\u8BB0\u7D2F\u8BA1\u83B7\u5F97 50 \u4E2A\u8D5E",
    icon: "\u2764\uFE0F",
    type: "creation",
    condition: "\u7D2F\u8BA1\u70B9\u8D5E \u2265 50",
    progressType: "totalLikes",
    progressTarget: 50,
    xpReward: 100
  },
  // 社交类
  {
    id: "ach-social",
    name: "\u793E\u4EA4\u8FBE\u4EBA",
    description: "\u52A0\u5165 3 \u4E2A\u5B66\u4E60\u5708\u5B50",
    icon: "\u{1F465}",
    type: "social",
    condition: "\u52A0\u5165\u5708\u5B50\u6570 \u2265 3",
    progressType: "joinedCircles",
    progressTarget: 3,
    xpReward: 60
  },
  {
    id: "ach-social-5",
    name: "\u5708\u5B50\u9886\u8896",
    description: "\u52A0\u5165 5 \u4E2A\u5B66\u4E60\u5708\u5B50",
    icon: "\u{1F3C5}",
    type: "social",
    condition: "\u52A0\u5165\u5708\u5B50\u6570 \u2265 5",
    progressType: "joinedCircles",
    progressTarget: 5,
    xpReward: 150
  },
  // 里程碑类
  {
    id: "ach-ai-first",
    name: "AI \u5148\u884C\u8005",
    description: "\u9996\u6B21\u91C7\u7EB3 AI \u63A8\u8350\uFF08\u6280\u80FD/\u4EFB\u52A1/\u5708\u5B50\uFF09",
    icon: "\u{1F916}",
    type: "milestone",
    condition: "\u91C7\u7EB3 AI \u63A8\u8350 \u2265 1",
    progressType: "aiAdoptions",
    progressTarget: 1,
    xpReward: 100
  },
  {
    id: "ach-custom-skill",
    name: "\u9020\u7269\u4E3B",
    description: "\u81EA\u5B9A\u4E49\u521B\u5EFA\u7B2C\u4E00\u4E2A\u6280\u80FD\u8282\u70B9",
    icon: "\u{1F6E0}\uFE0F",
    type: "milestone",
    condition: "\u81EA\u5B9A\u4E49\u6280\u80FD \u2265 1",
    progressType: "customSkills",
    progressTarget: 1,
    xpReward: 100
  }
];
var seedUser = {
  id: "user-demo",
  name: "\u5F20\u5C0F\u660E",
  email: "zhangxiaoming@example.com",
  age: 28,
  level: 3,
  totalXp: 1250,
  dailyLearningHours: 2,
  lifeTimeLeft: 72 * 365,
  preferences: {
    learningStyle: "visual",
    difficultyPreference: "medium",
    notificationEnabled: true,
    themes: "light"
  },
  achievements: []
};
var seedGameStats = {
  currentStreak: 3,
  longestStreak: 5,
  totalSkillsUnlocked: 1,
  totalTasksCompleted: 1,
  totalNotesCreated: 4,
  favoriteSkillCategories: ["\u524D\u7AEF"],
  weeklyProgress: Array.from({ length: 7 }, (_, i) => {
    const isToday = i === 0;
    return {
      date: daysAgo(i),
      learningMinutes: isToday ? 45 : [60, 90, 30, 120, 75, 45, 0][i],
      tasksCompleted: isToday ? 1 : [2, 3, 1, 4, 2, 1, 0][i],
      skillsProgressed: isToday ? 1 : [1, 2, 0, 1, 1, 0, 0][i],
      notesCreated: isToday ? 0 : [1, 1, 0, 1, 1, 0, 0][i],
      xpGained: isToday ? 45 : [60, 120, 30, 150, 80, 40, 0][i]
    };
  })
};
var seedActivities = [
  { id: "act-1", text: "\u5B8C\u6210\u4E86\u300C\u5B8C\u6210 HTML \u8BED\u4E49\u5316\u7EC3\u4E60\u300D\u4EFB\u52A1", type: "task", time: daysAgo(3, 21, 30) },
  { id: "act-2", text: "\u89E3\u9501\u4E86\u300C\u575A\u6301\u4E0D\u61C8\u300D\u6210\u5C31", type: "achievement", time: daysAgo(2, 9, 0) },
  { id: "act-3", text: "\u53D1\u5E03\u4E86\u5B66\u4E60\u7B14\u8BB0\u300CReact Hooks \u5FC3\u5F97\u300D", type: "note", time: daysAgo(2, 14, 30) },
  { id: "act-4", text: "\u52A0\u5165\u4E86\u300C\u524D\u7AEF\u5F00\u53D1\u5B66\u4E60\u5708\u300D\u5708\u5B50", type: "circle", time: daysAgo(5, 10, 0) }
];

// src/utils/index.ts
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// src/store/index.ts
var getLevel = (totalXp) => Math.floor(totalXp / 500) + 1;
var SUBTASK_XP = 15;
var TASK_XP = { low: 30, medium: 50, high: 80 };
var SKILL_XP = 100;
var TASK_TO_SKILL_XP_RATIO = 0.2;
var isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
var dateReviver = (_key, value) => {
  if (typeof value === "string" && isoDatePattern.test(value)) return new Date(value);
  return value;
};
function syncTreeStatuses(tree) {
  const statusMap = new Map(tree.skills.map((s) => [s.id, s.status]));
  const updated = tree.skills.map((skill) => {
    if (skill.status !== "locked" /* LOCKED */) return skill;
    const prereqsDone = skill.prerequisites.every((p) => statusMap.get(p) === "completed" /* COMPLETED */);
    if (prereqsDone) {
      return { ...skill, status: "available" /* AVAILABLE */ };
    }
    return skill;
  });
  return { ...tree, skills: updated };
}
function findFreePosition(skills) {
  const taken = skills.map((s) => `${Math.round(s.position.x / 100)}-${Math.round(s.position.y / 100)}`);
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 100 + col * 110;
      const y = 90 + row * 80;
      if (!taken.includes(`${col}-${row}`)) return { x, y };
    }
  }
  return { x: 400, y: 300 };
}
var useAppStore = create()(
  persist(
    (set, get) => {
      const snapshot = () => {
        const s = get();
        return {
          user: s.user,
          trees: s.trees,
          activeTreeId: s.activeTreeId,
          tasks: s.tasks,
          circles: s.circles,
          joinedCircleIds: s.joinedCircleIds,
          notes: s.notes,
          noteLikes: s.noteLikes,
          achievements: s.achievements,
          gameStats: s.gameStats,
          aiAdoptions: s.aiAdoptions,
          customSkills: s.customSkills
        };
      };
      const pushHistory = () => {
        const s = get();
        set({
          past: [...s.past.slice(-49), snapshot()],
          future: []
        });
      };
      return {
        user: seedUser,
        updateUser: (updates) => {
          pushHistory();
          set((state) => ({
            user: { ...state.user, ...updates },
            activities: [
              { id: generateId(), text: "\u66F4\u65B0\u4E86\u4E2A\u4EBA\u8D44\u6599", type: "note", time: /* @__PURE__ */ new Date() },
              ...state.activities
            ].slice(0, 30)
          }));
        },
        trees: seedTrees,
        activeTreeId: seedTrees[0].id,
        setActiveTree: (treeId) => set({ activeTreeId: treeId }),
        updateSkill: (treeId, skillId, updates) => {
          pushHistory();
          set((state) => ({
            trees: state.trees.map(
              (tree) => tree.id !== treeId ? tree : syncTreeStatuses({
                ...tree,
                skills: tree.skills.map((s) => s.id === skillId ? { ...s, ...updates } : s)
              })
            )
          }));
        },
        startSkill: (skillId) => {
          const { trees, activeTreeId } = get();
          const tree = trees.find((t) => t.id === activeTreeId);
          const skill = tree?.skills.find((s) => s.id === skillId);
          if (!skill || skill.status === "locked" /* LOCKED */) return;
          if (skill.status === "available" /* AVAILABLE */) {
            get().updateSkill(activeTreeId, skillId, { status: "learning" /* LEARNING */ });
            get().recordActivity(`\u5F00\u59CB\u4E86\u300C${skill.name}\u300D\u7684\u5B66\u4E60`, "skill");
          }
        },
        completeSkill: (skillId) => {
          const { trees, activeTreeId } = get();
          const tree = trees.find((t) => t.id === activeTreeId);
          const skill = tree?.skills.find((s) => s.id === skillId);
          if (!skill || skill.status === "completed" /* COMPLETED */) return;
          get().updateSkill(activeTreeId, skillId, { status: "completed" /* COMPLETED */, xp: skill.maxXp });
          get().addXp(SKILL_XP, `\u638C\u63E1\u6280\u80FD\u300C${skill.name}\u300D`);
          get().recordActivity(`\u638C\u63E1\u4E86\u300C${skill.name}\u300D\u6280\u80FD`, "skill");
          const related = get().tasks.filter((t) => t.skillId === skillId && t.status === "todo");
          related.forEach((t) => get().updateTask(t.id, { status: "in-progress" }));
        },
        addSkill: (treeId, skill) => {
          const tree = get().trees.find((t) => t.id === treeId);
          if (!tree) return;
          pushHistory();
          const newNode = {
            ...skill,
            id: generateId(),
            status: "available" /* AVAILABLE */,
            xp: skill.xp ?? 0,
            children: [],
            position: skill.position ?? findFreePosition(tree.skills)
          };
          set((state) => ({
            trees: state.trees.map(
              (t) => t.id === treeId ? { ...t, skills: [...t.skills, newNode] } : t
            ),
            ...skill.custom ? { customSkills: state.customSkills + 1 } : {}
          }));
          get().recordActivity(`\u5728\u300C${tree.name}\u300D\u4E2D\u6DFB\u52A0\u4E86\u65B0\u6280\u80FD\u300C${skill.name}\u300D`, "skill");
          get().checkAchievements();
        },
        deleteSkill: (treeId, skillId) => {
          pushHistory();
          set((state) => ({
            trees: state.trees.map((tree) => {
              if (tree.id !== treeId) return tree;
              const skills = tree.skills.filter((s) => s.id !== skillId).map((s) => ({
                ...s,
                prerequisites: s.prerequisites.filter((p) => p !== skillId),
                children: s.children.filter((c) => c !== skillId)
              }));
              return syncTreeStatuses({ ...tree, skills });
            })
          }));
        },
        resetTree: (treeId) => {
          const original = seedTrees.find((t) => t.id === treeId);
          if (!original) return;
          pushHistory();
          set((state) => ({
            trees: state.trees.map(
              (t) => t.id === treeId ? { ...original, skills: original.skills.map((s) => ({ ...s })) } : t
            )
          }));
        },
        addTree: (input) => {
          pushHistory();
          const id = `tree-${generateId()}`;
          const newTree = {
            id,
            name: input.name.trim(),
            description: input.description?.trim() || "\u81EA\u5B9A\u4E49\u6280\u80FD\u6811",
            category: input.category?.trim() || "\u81EA\u5B9A\u4E49",
            difficulty: "beginner",
            estimatedDuration: 0,
            tags: [input.category?.trim() || "\u81EA\u5B9A\u4E49"],
            skills: []
          };
          set((state) => ({
            trees: [...state.trees, newTree],
            activeTreeId: id
          }));
          get().recordActivity(`\u521B\u5EFA\u4E86\u6280\u80FD\u6811\u300C${newTree.name}\u300D`, "skill");
          return id;
        },
        deleteTree: (treeId) => {
          const { trees, activeTreeId } = get();
          if (trees.length <= 1) {
            get().recordActivity("\u65E0\u6CD5\u5220\u9664\u6700\u540E\u4E00\u68F5\u6280\u80FD\u6811", "skill");
            return;
          }
          const tree = trees.find((t) => t.id === treeId);
          pushHistory();
          const remaining = trees.filter((t) => t.id !== treeId);
          set({
            trees: remaining,
            activeTreeId: activeTreeId === treeId ? remaining[0].id : activeTreeId
          });
          if (tree) get().recordActivity(`\u5220\u9664\u4E86\u6280\u80FD\u6811\u300C${tree.name}\u300D`, "skill");
        },
        tasks: seedTasks,
        addTask: (task) => {
          pushHistory();
          const newNode = {
            ...task,
            id: generateId(),
            status: "todo",
            subtasks: task.subtasks ?? [],
            aiGenerated: false,
            dueDate: task.dueDate ?? void 0
          };
          set((state) => ({ tasks: [newNode, ...state.tasks] }));
          get().recordActivity(`\u521B\u5EFA\u4E86\u4EFB\u52A1\u300C${task.title}\u300D`, "task");
        },
        updateTask: (taskId, updates) => set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
        })),
        deleteTask: (taskId) => {
          pushHistory();
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
        },
        toggleSubtask: (taskId, subtaskId) => {
          pushHistory();
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) return;
          const subtasks = task.subtasks.map(
            (st) => st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone = subtasks.length > 0 && subtasks.every((st) => st.completed);
          const wasCompleted = task.status === "completed";
          const updates = { subtasks };
          if (allDone && !wasCompleted) {
            updates.status = "completed";
            updates.actualMinutes = task.estimatedMinutes;
            get().addXp(TASK_XP[task.priority] ?? 50, `\u5B8C\u6210\u4EFB\u52A1\u300C${task.title}\u300D`);
            get().recordActivity(`\u5B8C\u6210\u4E86\u300C${task.title}\u300D\u4EFB\u52A1`, "task");
            get().bumpDailyProgress({ tasksCompleted: 1, xpGained: TASK_XP[task.priority] ?? 50 });
            if (task.skillId) get().progressSkillXp(task.skillId);
          } else if (!allDone && wasCompleted) {
            updates.status = "in-progress";
          }
          get().updateTask(taskId, updates);
        },
        setTaskStatus: (taskId, status) => {
          pushHistory();
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) return;
          const updates = { status };
          if (status === "completed" && task.status !== "completed") {
            updates.subtasks = task.subtasks.map((st) => ({ ...st, completed: true }));
            get().addXp(TASK_XP[task.priority] ?? 50, `\u5B8C\u6210\u4EFB\u52A1\u300C${task.title}\u300D`);
            get().recordActivity(`\u5B8C\u6210\u4E86\u300C${task.title}\u300D\u4EFB\u52A1`, "task");
            if (task.skillId) get().progressSkillXp(task.skillId);
          }
          get().updateTask(taskId, updates);
        },
        circles: seedCircles,
        joinedCircleIds: ["circle-frontend", "circle-ai"],
        joinCircle: (circleId) => {
          if (get().joinedCircleIds.includes(circleId)) return;
          pushHistory();
          set((state) => ({
            joinedCircleIds: [...state.joinedCircleIds, circleId],
            circles: state.circles.map(
              (c) => c.id === circleId ? { ...c, memberCount: c.memberCount + 1 } : c
            )
          }));
          const circle = get().circles.find((c) => c.id === circleId);
          if (circle) get().recordActivity(`\u52A0\u5165\u4E86\u300C${circle.name}\u300D\u5708\u5B50`, "circle");
        },
        leaveCircle: (circleId) => {
          pushHistory();
          set((state) => ({
            joinedCircleIds: state.joinedCircleIds.filter((id) => id !== circleId),
            circles: state.circles.map(
              (c) => c.id === circleId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
            )
          }));
        },
        addCircle: (circle) => {
          pushHistory();
          const id = `circle-${generateId()}`;
          const newNode = {
            ...circle,
            id,
            memberCount: circle.memberCount ?? 1,
            posts: [],
            isPrivate: false,
            createdAt: /* @__PURE__ */ new Date()
          };
          set((state) => ({
            circles: [...state.circles, newNode],
            joinedCircleIds: [...state.joinedCircleIds, id]
          }));
          get().recordActivity(`\u521B\u5EFA\u5E76\u52A0\u5165\u4E86\u5708\u5B50\u300C${newNode.name}\u300D`, "circle");
          return id;
        },
        notes: seedNotes,
        noteLikes: { "note-react-hooks": 12, "note-ts-inference": 8, "note-css-layout": 3, "note-js-eventloop": 5 },
        addNote: (note) => {
          pushHistory();
          const now = /* @__PURE__ */ new Date();
          const newNode = { ...note, id: generateId(), createdAt: now, updatedAt: now };
          set((state) => ({ notes: [newNode, ...state.notes] }));
          get().recordActivity("\u53D1\u5E03\u4E86\u65B0\u7684\u5B66\u4E60\u7B14\u8BB0", "note");
          get().bumpDailyProgress({ notesCreated: 1 });
        },
        updateNote: (noteId, updates) => {
          pushHistory();
          set((state) => ({
            notes: state.notes.map(
              (n) => n.id === noteId ? { ...n, ...updates, updatedAt: /* @__PURE__ */ new Date() } : n
            )
          }));
        },
        deleteNote: (noteId) => {
          pushHistory();
          set((state) => ({ notes: state.notes.filter((n) => n.id !== noteId) }));
        },
        toggleLikeNote: (noteId) => set((state) => ({
          noteLikes: {
            ...state.noteLikes,
            [noteId]: (state.noteLikes[noteId] ?? 0) + (state.noteLikes[noteId] ? -1 : 1)
          }
        })),
        achievements: seedAchievements,
        gameStats: seedGameStats,
        aiAdoptions: 0,
        customSkills: 0,
        activities: seedActivities,
        past: [],
        future: [],
        undo: () => {
          const { past, future } = get();
          if (past.length === 0) return;
          const prev = past[past.length - 1];
          set({
            ...prev,
            past: past.slice(0, -1),
            future: [snapshot(), ...future].slice(0, 50)
          });
        },
        redo: () => {
          const { past, future } = get();
          if (future.length === 0) return;
          const next = future[0];
          set({
            ...next,
            past: [...past, snapshot()].slice(-50),
            future: future.slice(1)
          });
        },
        addXp: (amount, reason) => {
          const { user, achievements } = get();
          const totalXp = user.totalXp + amount;
          const oldLevel = getLevel(user.totalXp);
          const newLevel = getLevel(totalXp);
          set({
            user: { ...user, totalXp, level: newLevel }
          });
          if (newLevel > oldLevel) {
            get().recordActivity(`\u5347\u7EA7\u5566\uFF01\u8FBE\u5230 Lv.${newLevel}`, "achievement");
          }
          if (reason) ;
          if (achievements) ;
          get().checkAchievements();
        },
        /** 任务完成 → 关联技能 XP 推进（数据闭环） */
        progressSkillXp: (skillId) => {
          const { trees, activeTreeId } = get();
          const tree = trees.find((t) => t.id === activeTreeId);
          const skill = tree?.skills.find((s) => s.id === skillId);
          if (!skill || skill.status === "completed" /* COMPLETED */) return;
          const gained = Math.round(skill.maxXp * TASK_TO_SKILL_XP_RATIO);
          const newXp = Math.min(skill.maxXp, skill.xp + gained);
          get().updateSkill(activeTreeId, skillId, { xp: newXp });
          get().bumpDailyProgress({ skillsProgressed: 1 });
        },
        recordAIAdoption: (kind) => {
          set((state) => ({ aiAdoptions: state.aiAdoptions + 1 }));
          get().recordActivity(`\u91C7\u7EB3\u4E86 AI \u63A8\u8350\u7684${kind === "skill" ? "\u6280\u80FD" : kind === "task" ? "\u4EFB\u52A1" : "\u5708\u5B50"}`, "achievement");
          get().checkAchievements();
        },
        checkAchievements: () => {
          const { achievements, user, tasks, trees, notes, joinedCircleIds, gameStats, aiAdoptions, customSkills } = get();
          const completedTasks = tasks.filter((t) => t.status === "completed").length;
          const masteredSkills = trees.flatMap((t) => t.skills).filter((s) => s.status === "completed" /* COMPLETED */).length;
          const frontendMastered = trees.find((t) => t.id === "tree-frontend")?.skills.some((s) => s.status === "completed" /* COMPLETED */);
          const backendMastered = trees.find((t) => t.id === "tree-backend")?.skills.some((s) => s.status === "completed" /* COMPLETED */);
          const totalLikes = Object.values(get().noteLikes).reduce((a, b) => a + b, 0);
          const shouldUnlock = {
            "ach-first-task": completedTasks >= 1,
            "ach-task-master": completedTasks >= 10,
            "ach-task-legend": completedTasks >= 30,
            "ach-skill-master": masteredSkills >= 5,
            "ach-skill-10": masteredSkills >= 10,
            "ach-fullstack": !!(frontendMastered && backendMastered),
            "ach-streak": gameStats.currentStreak >= 3,
            "ach-streak-7": gameStats.currentStreak >= 7,
            "ach-note-writer": notes.length >= 5,
            "ach-note-20": notes.length >= 20,
            "ach-social": joinedCircleIds.length >= 3,
            "ach-social-5": joinedCircleIds.length >= 5,
            "ach-xp-1000": user.totalXp >= 1e3,
            "ach-xp-5000": user.totalXp >= 5e3,
            "ach-lv5": getLevel(user.totalXp) >= 5,
            "ach-like-50": totalLikes >= 50,
            "ach-ai-first": aiAdoptions >= 1,
            "ach-custom-skill": customSkills >= 1
          };
          let changed = false;
          const updated = achievements.map((a) => {
            if (!a.unlockedAt && shouldUnlock[a.id]) {
              changed = true;
              get().recordActivity(`\u89E3\u9501\u4E86\u6210\u5C31\u300C${a.name}\u300D`, "achievement");
              return { ...a, unlockedAt: /* @__PURE__ */ new Date() };
            }
            return a;
          });
          if (changed) set({ achievements: updated });
        },
        recordActivity: (text, type) => set((state) => ({
          activities: [{ id: generateId(), text, type, time: /* @__PURE__ */ new Date() }, ...state.activities].slice(0, 30)
        })),
        bumpDailyProgress: (patch) => set((state) => {
          const weekly = [...state.gameStats.weeklyProgress];
          const today = /* @__PURE__ */ new Date();
          today.setHours(0, 0, 0, 0);
          const idx = weekly.findIndex((d) => {
            const date = new Date(d.date);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === today.getTime();
          });
          if (idx === -1) return { gameStats: state.gameStats };
          weekly[idx] = { ...weekly[idx], ...patch };
          return {
            gameStats: {
              ...state.gameStats,
              weeklyProgress: weekly,
              totalTasksCompleted: state.gameStats.totalTasksCompleted + (patch.tasksCompleted ?? 0),
              totalNotesCreated: state.gameStats.totalNotesCreated + (patch.notesCreated ?? 0)
            }
          };
        })
      };
    },
    {
      name: "ai-skill-tree-data",
      // createJSONStorage 负责 JSON 序列化；reviver 把 ISO 日期字符串还原为 Date
      storage: createJSONStorage(() => localStorage, {
        reviver: dateReviver
      }),
      version: 2,
      // 撤销历史不持久化（刷新后清空，避免占用存储）
      partialize: (state) => {
        const { past, future, ...rest } = state;
        return rest;
      }
    }
  )
);
var useActiveTree = () => {
  const trees = useAppStore((s) => s.trees);
  const activeTreeId = useAppStore((s) => s.activeTreeId);
  return trees.find((t) => t.id === activeTreeId) ?? trees[0];
};
var useAllSkills = () => {
  const trees = useAppStore((s) => s.trees);
  return trees.flatMap((t) => t.skills);
};
export {
  SKILL_XP,
  SUBTASK_XP,
  TASK_TO_SKILL_XP_RATIO,
  TASK_XP,
  getLevel,
  useActiveTree,
  useAllSkills,
  useAppStore
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
