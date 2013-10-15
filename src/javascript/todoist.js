var GMouseHover, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GMouseHover = (function () {
    function a() {
        this.attach = __bind(this.attach, this);
        this.clearCurrentTimeout = __bind(this.clearCurrentTimeout, this)
    }
    a.prototype.default_timeout = 400;
    a.prototype.timeouts = {};
    a.prototype.current_id = null;
    a.prototype.clearCurrentTimeout = function () {
        var c, d, b;
        if (this.current_timeout) {
            b = this.current_timeout, d = b[0], c = b[1];
            clearTimeout(c);
            delete this.timeouts[d]
        }
        return this.current_id = null
    };
    a.prototype.attach = function (i, h, b, f, c) {
        var d, g = this;
        if (c == null) {
            c = {}
        }
        d = c.timeout || this.default_timeout;
        AEV(i, "mouseover", function (j) {
            var k;
            k = g.timeouts[h];
            if (k) {
                clearTimeout(k);
                delete g.timeouts[h]
            }
            if (g.current_id === h) {
                return
            }
            g.current_id = h;
            if (b) {
                return b(j)
            }
        });
        return AEV(i, "mouseout", function (j) {
            var k;
            k = g.timeouts[h];
            if (k) {
                clearTimeout(k)
            }
            g.timeouts[h] = setTimeout(function (l) {
                g.current_id = null;
                if (b) {
                    return f(l)
                }
            }, d);
            return g.current_timeout = [h, g.timeouts[h]]
        })
    };
    return a
})();
window.MouseHover = new GMouseHover();
var GAgendaHelpers, GDragAndDrop, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GDragAndDrop = (function () {
    function a() {
        this.onEndToProject = __bind(this.onEndToProject, this);
        this.onDragToProject = __bind(this.onDragToProject, this);
        this.agendaOnStart = __bind(this.agendaOnStart, this);
        this.agendaOnDrag = __bind(this.agendaOnDrag, this);
        this.agendaOnEnd = __bind(this.agendaOnEnd, this);
        this.genericMakeSortable = __bind(this.genericMakeSortable, this);
        this.genericOnEnd = __bind(this.genericOnEnd, this);
        this.genericMouseDown = __bind(this.genericMouseDown, this);
        this.projectListMakeSortable = __bind(this.projectListMakeSortable, this);
        this.projectEditorMakeSortable = __bind(this.projectEditorMakeSortable, this);
        this.agendaMakeSortable = __bind(this.agendaMakeSortable, this);
        this.attach = __bind(this.attach, this);
        this.attachHandler = __bind(this.attachHandler, this);
        this.handler = DIV({
            c: "drag_and_drop_handler"
        }, imageSprite("cmp_reorder_handler", 16, 23));
        this.handler.onmousedown = this.genericMouseDown;
        this.handler.reuseable = true;
        this.current_li = null;
        this.current_mode = "waiting"
    }
    a.prototype.attachHandler = function (b) {
        this.current_li = b;
        if ($gc(b, "img", "arrow")) {
            addClass(this.handler, "extra_arrow_marigin")
        } else {
            removeClass(this.handler, "extra_arrow_marigin")
        }
        return ATT(b, this.handler)
    };
    a.prototype.attach = function (b, d, f) {
        var g, c, h = this;
        if (f == null) {
            f = {}
        }
        c = function (i) {
            if (h.current_mode === "reordering") {
                return false
            }
            MouseHover.clearCurrentTimeout();
            return h.attachHandler(b)
        };
        g = function (i) {
            return removeElement(h.handler)
        };
        return MouseHover.attach(b, "drag_and_drop_" + b.json.id, c, g, 100)
    };
    a.prototype.agendaMakeSortable = function (b) {
        return this.genericMakeSortable(Agenda, b)
    };
    a.prototype.projectEditorMakeSortable = function (b) {
        this.current_editor = ProjectEditorManager.current_editor;
        return this.genericMakeSortable(this.current_editor, b)
    };
    a.prototype.projectListMakeSortable = function (b) {
        return this.genericMakeSortable(ProjectList, b)
    };
    a.prototype.genericMouseDown = function (b) {
        if (hasClass(this.current_li, "agenda_item")) {
            return this.agendaMakeSortable(b)
        } else {
            if (hasClass(this.current_li, "task_item")) {
                return this.projectEditorMakeSortable(b)
            } else {
                return this.projectListMakeSortable(b)
            }
        }
    };
    a.prototype.genericOnEnd = function (b) {
        this.current_mode = "waiting";
        this.current_editor = null;
        return this.sortable.onEnd()
    };
    a.prototype.genericMakeSortable = function (l, o) {
        var m, f, n, d, b, q, h, j, c, g, p, i, k = this;
        l.save_indent = false;
        this.handler.onmousedown = this.genericMouseDown;
        f = $gp(this.handler, "li");
        if (l.list_class === "ProjectEditor") {
            h = [];
            m = $bytc("li", "task_item");
            i = $bytc("li", "task_item");
            for (g = 0, p = i.length; g < p; g++) {
                c = i[g];
                if (hasClass(c, "reorder_item") || c.json && !isElementHidden(c)) {
                    h.push(c)
                }
            }
        } else {
            h = l.getAllRenrededItems(true)
        }
        this.sortable = j = new Sortable(h, l);
        this.project_items = null;
        n = false;
        d = j.onDrag;
        b = j.onEnd;
        q = j.onStart;
        if (l.list_class === "ProjectEditor") {
            this.project_items = this.calculateProjectListXY();
            this.list_class = l;
            d = this.onDragToProject;
            b = this.onEndToProject;
            if (!window.IS_MINI) {
                n = true
            }
        } else {
            if (l === ProjectList) {
                b = function () {
                    k.genericOnEnd();
                    l.saveOrder(Indicator.remove);
                    return l.arrows.updateArrows()
                }
            } else {
                if (l === Agenda) {
                    b = this.agendaOnEnd;
                    q = this.agendaOnStart;
                    d = this.agendaOnDrag;
                    this.sortable.set_indent = false
                }
            }
        }
        AJS.dnd.dragAble(f, {
            handler: this.handler,
            move_x: n,
            on_start: q,
            on_drag: d,
            on_end: b
        });
        this.current_mode = "reordering";
        AJS.dnd._start(this.handler, o);
        preventDefault(o);
        return false
    };
    a.prototype.agendaOnEnd = function (o) {
        var q, i, k, b, m, r, s, l, j, f, d, n, c, g, p, h;
        i = AJS.dnd.current_root;
        b = i.json;
        this.genericOnEnd(o);
        if (this.postpone_box) {
            c = hasClass(this.postpone_box, "will_drop_bg");
            removeElement(this.postpone_box);
            if (c) {
                Postpone.postPoneUpdate([i], true);
                return
            }
        }
        removeClass(i, "moved");
        removeElement($bytc("span", "new_date", i));
        n = $gp(i, "ul");
        m = hasClass(n, "is_filtered");
        j = {};
        f = 1;
        h = n.childNodes;
        for (g = 0, p = h.length; g < p; g++) {
            r = h[g];
            if (hasClass(r, "moved")) {
                continue
            }
            if (r.json && r.json.id) {
                j[r.json.id] = f++
            }
        }
        k = b.due_date;
        s = n.day_date;
        if (k && s) {
            if (!DateItemRenderer.isSameDay(k, s)) {
                d = DateController.getTime(b.date_string, true);
                q = DateController.formatDate(s, false, true, false, true);
                if (d) {
                    q += d
                }
                l = DateBocks.magicDate(q);
                l.tz_set = true;
                b = ItemsModel.update(b.id, {
                    due_date: l,
                    date_string: b.date_string
                })
            }
        }
        if (!m) {
            ItemsModel.updateDayOrders(j)
        }
        Agenda.arrows.updateArrows(n);
        return AgendaHelpers.updateDayStyles()
    };
    a.prototype.agendaOnDrag = function (f) {
        var g, c, d, b;
        this.sortable.onDrag();
        if (this.postpone_box) {
            b = absolutePosition(this.postpone_box).y;
            c = AJS.dnd.mouse_pos || getMousePos();
            d = c.y;
            g = b - d;
            if (g < 14 && g > -60) {
                return addClass(this.postpone_box, "will_drop_bg")
            } else {
                return removeClass(this.postpone_box, "will_drop_bg")
            }
        }
    };
    a.prototype.agendaOnStart = function (j) {
        var d, h, k, c, b, g, i, f;
        d = AJS.dnd.current_root;
        c = d.json;
        i = $gp(d, "ul");
        f = Postpone.getNewDate(c, true), g = f[0], b = f[1], h = f[2], k = f[3];
        this.postpone_box = DIV({
            id: "postpone_box"
        }, setHTML(SPAN(), _("Drop to postpone: <b>%s</b>").replace("%s", h)));
        setOpacity(this.postpone_box, 0);
        insertAfter(this.postpone_box, i);
        AJS.fx.fadeIn(this.postpone_box);
        return this.sortable.onStart()
    };
    a.prototype.calculateProjectListXY = function () {
        var d, h, c, g, b, f;
        c = [];
        f = ProjectList.getAllRenrededItems(true, false);
        for (g = 0, b = f.length; g < b; g++) {
            d = f[g];
            h = absolutePosition(d);
            h.x_max = h.x + d.offsetWidth;
            h.y_max = h.y + d.offsetHeight;
            h.project = d;
            c.push(h)
        }
        return c
    };
    a.prototype.onDragToProject = function (k) {
        var c, i, h, b, j, f, l, g, d;
        this.sortable.onDrag();
        c = AJS.dnd.mouse_pos || getMousePos();
        i = c.x;
        h = c.y;
        if (this.drop_to_project) {
            removeClass(this.drop_to_project, "will_drop_bg");
            this.drop_to_project = null
        }
        g = this.project_items;
        d = [];
        for (f = 0, l = g.length; f < l; f++) {
            j = g[f];
            b = i >= j.x && i <= j.x_max;
            b = b && h >= j.y && h <= j.y_max;
            if (b) {
                addClass(j.project, "will_drop_bg");
                this.drop_to_project = j.project;
                break
            } else {
                d.push(void 0)
            }
        }
        return d
    };
    a.prototype.onEndToProject = function (n) {
        var f, q, p, r, l, b, m, k, i, h, g, o, d, c, j;
        this.current_mode = "waiting";
        j = this.project_items;
        for (i = 0, o = j.length; i < o; i++) {
            m = j[i];
            removeClass(m.project, "will_drop_bg")
        }
        b = AJS.dnd.current_root;
        q = this.sortable.cur_child;
        this.sortable.onEnd();
        p = $gp(b, "div", "project_editor_instance");
        if (p) {
            p = ElementStore.get(p, "editor")
        }
        if (this.drop_to_project) {
            l = [b];
            if (q) {
                l = l.concat(q)
            }
            k = ItemSelecter.getProjectItems(l);
            MoveItems.doMoveItemsRequest(k, this.drop_to_project.json.id);
            for (h = 0, d = l.length; h < d; h++) {
                r = l[h];
                removeElement(r)
            }
            this.drop_to_project = null
        } else {
            if (p && this.current_editor !== p) {
                ItemsModel.update(b.json.id, {
                    project_id: p.project_id
                });
                p.saveOrder(Indicator.remove);
                swapDOM(b, b = p.renderItem(b.json));
                for (g = 0, c = q.length; g < c; g++) {
                    f = q[g];
                    swapDOM(f, p.renderItem(f.json))
                }
                GenericManagerUtils.showChildren($FA(p.current_list.childNodes));
                this.current_editor.arrows.updateArrows();
                p.arrows.updateArrows()
            } else {
                this.current_editor.saveOrder(Indicator.remove);
                this.current_editor.arrows.updateArrows()
            }
        }
        MouseHover.clearCurrentTimeout();
        return this.attachHandler(b)
    };
    return a
})();
GAgendaHelpers = (function () {
    function a() {}
    a.prototype.updateDayStyles = function () {
        var l, k, d, n, c, i, h, m, b, j, g, f;
        j = $bytc("h2", "section_header");
        f = [];
        for (i = 0, m = j.length; i < m; i++) {
            d = j[i];
            k = d.parentNode;
            c = k.nextSibling;
            l = 0;
            g = c.childNodes;
            for (h = 0, b = g.length; h < b; h++) {
                n = g[h];
                if (n.json && n.json.id) {
                    l += 1
                }
            }
            if (l === 0) {
                if (hasClass(d, "overdue")) {
                    removeElement(k);
                    f.push(removeElement(c))
                } else {
                    f.push(addClass(k, "no_tasks"))
                }
            } else {
                f.push(removeClass(k, "no_tasks"))
            }
        }
        return f
    };
    return a
})();
window.DragAndDrop = new GDragAndDrop();
window.AgendaHelpers = new GAgendaHelpers();
var GGlobalStorage, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
window.$storage = function (a) {
    return {
        set: function (b) {
            GlobalStorage.storeLocally(a, b);
            return b
        },
        get: function () {
            var b, c;
            b = GlobalStorage.cache[a];
            if (b !== void 0) {
                return b
            }
            c = localStorage.getItem(a);
            if (c) {
                if (window.JSON) {
                    c = JSON.parse(c)
                } else {
                    c = evalTxt(c)
                }
                GlobalStorage.cache[a] = c
            }
            return c
        },
        remove: function () {
            if (window.localStorage) {
                localStorage.removeItem(a)
            }
            if (GlobalStorage.cache[a]) {
                return delete GlobalStorage.cache[a]
            }
        }
    }
};
GGlobalStorage = (function () {
    function a() {
        this._storeLocally = __bind(this._storeLocally, this);
        this.storeLocally = __bind(this.storeLocally, this)
    }
    a.prototype.cache = {};
    a.prototype.timeouts = {};
    a.prototype.storeLocally = function (c, d) {
        var b, f = this;
        this.cache[c] = d;
        if (this.timeouts[c]) {
            clearTimeout(this.timeouts[c]);
            delete this.timeouts[c]
        }
        b = function () {
            f._storeLocally(c, f.cache[c]);
            if (f.timeouts[c]) {
                return delete f.timeouts[c]
            }
        };
        this.timeouts[c] = setTimeout(b, 0.3);
        return d
    };
    a.prototype._storeLocally = function (b, c) {
        if (window.JSON) {
            c = JSON.stringify(c)
        } else {
            c = serializeJSON(c)
        } if (c !== localStorage.getItem(b)) {
            return localStorage.setItem(b, c)
        }
    };
    return a
})();
window.GlobalStorage = new GGlobalStorage();
var GLoginEngine, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GLoginEngine = (function () {
    function a() {
        this.logout = __bind(this.logout, this);
        this.isLoggedIn = __bind(this.isLoggedIn, this);
        this.getLogin = __bind(this.getLogin, this);
        this.setLogin = __bind(this.setLogin, this);
        this.user = $storage("ApiUser").get();
        this.token = $storage("ApiToken").get()
    }
    a.prototype.setLogin = function (b, c) {
        if ($storage("UserId").get() !== b.id) {
            this.clearLocalData()
        }
        this.user = b;
        this.token = c;
        $storage("ApiUser").set(b);
        $storage("ApiToken").set(c);
        return $storage("UserId").set(b.id)
    };
    a.prototype.getLogin = function () {
        return [this.user, this.token]
    };
    a.prototype.isLoggedIn = function () {
        return this.token && this.user
    };
    a.prototype.logout = function () {
        this.user = null;
        this.token = null;
        return this.clearLocalData()
    };
    a.prototype.clearLocalData = function () {
        $storage("ApiUser").remove();
        $storage("ApiToken").remove();
        return $storage("UserId").remove()
    };
    return a
})();
window.LoginEngine = new GLoginEngine();
var GItemsModel, ItemsModel, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GItemsModel = (function () {
    function a() {
        this._getMaxOrder = __bind(this._getMaxOrder, this);
        this._setNotifications = __bind(this._setNotifications, this);
        this.convertToDateObject = __bind(this.convertToDateObject, this);
        this.loadDayOrders = __bind(this.loadDayOrders, this);
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this._sanitizeArgs = __bind(this._sanitizeArgs, this);
        this._addToModel = __bind(this._addToModel, this);
        this._areArgsUpdated = __bind(this._areArgsUpdated, this);
        this._completeGeneric = __bind(this._completeGeneric, this);
        this.uncomplete = __bind(this.uncomplete, this);
        this.complete = __bind(this.complete, this);
        this.moveMultiple = __bind(this.moveMultiple, this);
        this.updateCached = __bind(this.updateCached, this);
        this.updateDayOrders = __bind(this.updateDayOrders, this);
        this.updateOrdersIndents = __bind(this.updateOrdersIndents, this);
        this.update = __bind(this.update, this);
        this.deleteCacheByProjectId = __bind(this.deleteCacheByProjectId, this);
        this.deleteItem = __bind(this.deleteItem, this);
        this.add = __bind(this.add, this);
        this.resolveTempIds = __bind(this.resolveTempIds, this);
        this.loadData = __bind(this.loadData, this);
        this.clearHistoryItems = __bind(this.clearHistoryItems, this);
        this.clearCache = __bind(this.clearCache, this);
        this.getChildren = __bind(this.getChildren, this);
        this.getByProjectId = __bind(this.getByProjectId, this);
        this.getById = __bind(this.getById, this);
        this.getAll = __bind(this.getAll, this)
    }
    a.prototype.max_limit = 150;
    a.prototype.model_data = {};
    a.prototype.cache_project_items = {};
    a.prototype.cache_all_items = [];
    a.prototype.getAll = function (g) {
        var d, c, b, f;
        if (g == null) {
            g = true
        }
        if (this.cache_all_items) {
            return this.cache_all_items
        }
        b = [];
        f = this.model_data;
        for (c in f) {
            d = f[c];
            if (!g || d.in_history === 0 && d.checked === 0) {
                b.push(d)
            }
        }
        this.cache_all_items = b;
        return b
    };
    a.prototype.getById = function (b) {
        return this.model_data[b]
    };
    a.prototype.getByProjectId = function (c) {
        var h, d, g, b, f;
        c = TemporaryIds.getRealId(c);
        if (!TemporaryIds.isTemporary(c)) {
            c = parseInt(c)
        }
        if (this.cache_project_items[c]) {
            return this.cache_project_items[c]
        }
        b = [];
        f = this.model_data;
        for (h in f) {
            d = f[h];
            g = TemporaryIds.getRealId(d.project_id);
            if (g === c && !d.in_history) {
                b.push(d)
            }
        }
        b.sort(UtilModels.sortByItemOrder);
        this.cache_project_items[c] = b;
        return b
    };
    a.prototype.getChildren = function (c, d) {
        var b;
        if (d == null) {
            d = false
        }
        b = this.getByProjectId(c.project_id);
        return UtilModels.getChildren(b, c, d)
    };
    a.prototype.clearCache = function (b) {
        var c;
        if (!b) {
            this.cache_project_items = {}
        } else {
            c = this.cache_project_items[b];
            if (c !== void 0) {
                delete this.cache_project_items[b]
            }
        }
        return this.cache_all_items = null
    };
    a.prototype.clearHistoryItems = function () {
        var b, d, k, c, j, g, i, h, f;
        d = [];
        h = this.model_data;
        for (b in h) {
            c = h[b];
            if (c.in_history) {
                d.push(b)
            }
        }
        j = this.model_data;
        f = [];
        for (g = 0, i = d.length; g < i; g++) {
            k = d[g];
            if (j[k]) {
                f.push(delete j[k])
            } else {
                f.push(void 0)
            }
        }
        return f
    };
    a.prototype.loadData = function (c) {
        var d, f, b;
        for (f = 0, b = c.length; f < b; f++) {
            d = c[f];
            this.convertToDateObject(d);
            this._addToModel(d, false, false)
        }
        this.clearHistoryItems();
        return this.syncCachedData()
    };
    a.prototype.resolveTempIds = function (b) {
        var i, k, n, o, j, l, g, f, m, c, h, d;
        i = false;
        h = keys(this.model_data);
        for (g = 0, m = h.length; g < m; g++) {
            o = h[g];
            n = this.model_data[o];
            l = b[o];
            if (l) {
                n.id = b[o];
                this.model_data[l] = n;
                delete this.model_data[o];
                i = true
            }
            if (b[n.project_id]) {
                n.project_id = b[n.project_id];
                i = true
            }
            if (n.labels) {
                k = [];
                d = n.labels;
                for (f = 0, c = d.length; f < c; f++) {
                    j = d[f];
                    k.push(b[j] || j)
                }
                n.labels = k;
                i = true
            }
        }
        if (i) {
            this.cache_project_items = {};
            this.cache_all_items = null;
            return this.syncCachedData()
        }
    };
    a.prototype.splitItemsIntoDates = function (h, g) {
        var b, j, f, k, c, d, i;
        if (g == null) {
            g = false
        }
        f = {};
        for (d = 0, i = h.length; d < i; d++) {
            j = h[d];
            if (j.due_date) {
                c = j.due_date.toDateString();
                b = f[c];
                if (!b) {
                    b = f[c] = {};
                    b.items = [];
                    b.date = new Date(c);
                    b.time = b.date.getTime()
                }
                b.items.push(j)
            }
        }
        k = values(f);
        k.sort(UtilModels.sortByDate);
        if (g) {
            k.reverse()
        }
        return k
    };
    a.prototype.add = function (d) {
        var f, c, b, g = this;
        f = {
            content: d.content || "",
            due_date: d.due_date || null,
            date_string: d.date_string || "",
            priority: d.priority,
            indent: d.indent || 1,
            item_order: d.item_order || 1,
            note_count: 0,
            labels: [],
            is_dst: 0,
            checked: 0,
            children: "",
            user_id: UserId,
            in_history: 0,
            collapsed: 0,
            date_added: new Date(),
            assigned_by_uid: UserId
        };
        if (f.indent > 5) {
            f.indent = 4
        }
        f.project_id = d.project_id;
        update(f, d);
        c = keys(this.getByProjectId(f.project_id));
        if (c.length >= this.max_limit) {
            alert(_("For performance reasons you can only add %s tasks pr. project. Please split your tasks in multiple projects.").replace("%s", this.max_limit));
            return
        }
        b = f.id = TemporaryIds.generate();
        TemporaryIds.listen(b, function (i, h) {
            f.id = h;
            g._addToModel(f);
            if (g.model_data[i]) {
                delete g.model_data[i]
            }
            g.syncCachedData();
            return g.clearCache(d.project_id)
        });
        LabelsModel.updateLabels(d, f);
        if (f.due_date) {
            f.time = f.due_date.getTime()
        }
        Signals.sendSignal("item_added", f);
        this._addToModel(f);
        SyncEngine.queueUpdate({
            type: "item_add",
            temp_id: b,
            args: this._sanitizeArgs(d)
        });
        ProjectsModel.updateCount(f.project_id);
        this.syncCachedData();
        this._setNotifications(f);
        return f
    };
    a.prototype.deleteItem = function (d, c) {
        var g, f, b;
        if (d.length === 0) {
            return
        }
        SyncEngine.queueUpdate({
            type: "item_delete",
            args: {
                ids: d,
                project_id: c
            }
        });
        for (f = 0, b = d.length; f < b; f++) {
            g = d[f];
            g = TemporaryIds.getRealId(g);
            if (this.model_data[g]) {
                delete this.model_data[g]
            }
        }
        this.syncCachedData();
        this.clearCache(c);
        return ProjectsModel.updateCount(c)
    };
    a.prototype.deleteCacheByProjectId = function (c, f) {
        var d, b, g;
        if (f == null) {
            f = true
        }
        g = this.model_data;
        for (b in g) {
            d = g[b];
            if (d.project_id === c) {
                delete this.model_data[d.id]
            }
        }
        if (f) {
            this.clearCache(c);
            return this.syncCachedData()
        }
    };
    a.prototype.update = function (c, g, h) {
        var d, f, k, l, b, j;
        if (h == null) {
            h = false
        }
        l = this.getById(c);
        if (l) {
            j = {};
            update(j, l);
            if (g.indent && g.indent > 4) {
                g.indent = 5
            }
            if (g.project_id && g.project_id !== l.project_id) {
                b = g.project_id;
                delete g.project_id
            } else {
                b = null
            }
            this._setNotifications(l);
            LabelsModel.updateLabels(g, l);
            g.id = l.id;
            if (this._areArgsUpdated(g, j) && h === false && b === false) {
                return [l, false]
            }
            SyncEngine.queueUpdate({
                type: "item_update",
                args: this._sanitizeArgs(g)
            });
            Signals.sendSignal("item_updated", g);
            this.updateCached(l, g);
            if (b) {
                d = {};
                d[l.project_id] = (function () {
                    var o, m, n, i;
                    n = this.getChildren(l, true);
                    i = [];
                    for (o = 0, m = n.length; o < m; o++) {
                        f = n[o];
                        i.push(f.id)
                    }
                    return i
                }).call(this);
                this.moveMultiple(d, b)
            }
            if (g.date_string && g.date_string !== l.date_string) {
                l.tz_set = false;
                l.due_date = new Date(l.due_date.getTime())
            }
            if (l.due_date) {
                l.time = l.due_date.getTime()
            } else {
                if (l.time) {
                    delete l.time
                }
            }
            ProjectsModel.updateCount(l.project_id);
            k = false;
            if (!DateUtils.isSameDate(j.due_date, g.due_date)) {
                k = true
            }
            if (g.priority && g.priority !== j.priority) {
                k = true
            }
            if (k) {
                g.day_order = l.day_order = -1
            }
            this.syncCachedData();
            return [l, true]
        } else {
            return [null, false]
        }
    };
    a.prototype.updateOrdersIndents = function (i) {
        var h, d, b, k, j, g, c, f;
        d = false;
        g = {};
        for (b in i) {
            h = i[b];
            k = this.model_data[b];
            if (k) {
                k.item_order = h[0];
                k.indent = h[1];
                g[k.project_id] = true;
                d = true
            }
        }
        if (d) {
            SyncEngine.queueUpdate({
                type: "item_update_orders_indents",
                args: {
                    ids_to_orders_indents: serializeJSON(i)
                }
            });
            this.syncCachedData();
            f = [];
            for (j in g) {
                c = g[j];
                f.push(this.clearCache(j))
            }
            return f
        }
    };
    a.prototype.updateDayOrders = function (f) {
        var d, j, g, b, c, i, h;
        d = false;
        i = {};
        for (j in f) {
            b = f[j];
            g = this.model_data[j];
            if (g) {
                g.day_order = b;
                i[g.project_id] = true;
                d = true
            }
        }
        if (d) {
            for (c in i) {
                h = i[c];
                this.clearCache(c)
            }
            SyncEngine.queueUpdate({
                type: "item_update_day_orders",
                args: {
                    ids_to_orders: serializeJSON(f)
                }
            });
            return this.syncCachedData()
        }
    };
    a.prototype.updateCached = function (c, b) {
        var d;
        c.id = TemporaryIds.getRealId(c.id);
        d = this.getById(c.id);
        this.clearCache(c.project_id);
        if (d) {
            update(d, b)
        }
        return update(c, b)
    };
    a.prototype.moveMultiple = function (j, g) {
        var f, i, m, n, k, c, h, b, d, l;
        b = ProjectsModel.get(g);
        if (!b) {
            return
        }
        c = this._getMaxOrder(g);
        for (h in j) {
            k = j[h];
            i = 0;
            f = this.getById(getFirst(k));
            if (f && f.indent > 1) {
                i = f.indent - 1
            }
            for (d = 0, l = k.length; d < l; d++) {
                n = k[d];
                m = this.getById(n);
                if (m) {
                    m.indent -= i;
                    this.updateCached(m, {
                        project_id: g,
                        item_order: c++,
                        indent: m.indent
                    })
                }
            }
            ProjectsModel.updateCount(h)
        }
        this.clearCache(g);
        ProjectsModel.updateCount(g);
        SyncEngine.queueUpdate({
            type: "item_move",
            args: {
                project_items: j,
                to_project: g
            }
        });
        return this.syncCachedData()
    };
    a.prototype.complete = function (g, f) {
        var d, c, b;
        if (f == null) {
            f = 0
        }
        return this._completeGeneric(g, "item_complete", c = 1, b = 1, d = false, f = f)
    };
    a.prototype.uncomplete = function (c, l, g) {
        var k, m, h, d, n, i, b, f, j;
        if (l == null) {
            l = false
        }
        if (g == null) {
            g = null
        }
        i = this._completeGeneric(c, "item_uncomplete", m = 0, d = 0, k = true, h = 0, g = g);
        if (l && i.length > 0) {
            b = this._getMaxOrder(i[0].project_id);
            for (f = 0, j = i.length; f < j; f++) {
                n = i[f];
                n.item_order = b++
            }
        }
        return i
    };
    a.prototype._completeGeneric = function (q, f, k, x, m, n, w) {
        var g, p, i, j, t, o, r, l, y, v, h, D, b, s, u, d, c, z, C;
        if (k == null) {
            k = 0
        }
        if (x == null) {
            x = 0
        }
        if (m == null) {
            m = false
        }
        if (n == null) {
            n = 0
        }
        if (w == null) {
            w = null
        }
        y = this.getById(q);
        if (y) {
            this.clearCache(y.project_id);
            l = RecurringDates.isEveryDate(y.date_string);
            if (l && k) {
                y.old_complete_date = y.due_date
            }
            if (l && !n) {
                if (m && y.old_complete_date) {
                    b = y.old_complete_date;
                    r = 0
                } else {
                    b = RecurringDates.getNonOverdueDate(y.due_date, y.date_string, true);
                    r = 1
                }
                y.due_date = b;
                y.time = y.due_date.getTime();
                SyncEngine.queueUpdate({
                    type: "item_update_date_complete",
                    args: {
                        id: y.id,
                        new_date_utc: this._formatDate(y),
                        date_string: y.date_string,
                        is_forward: r
                    }
                });
                y.checked = 0;
                y.day_order = -1;
                if (m) {
                    Signals.sendSignal("item_uncompleted", -1)
                } else {
                    Signals.sendSignal("item_completed", 1)
                }
                this.syncCachedData();
                return [y]
            } else {
                if (n) {
                    x = 1
                }
                s = 1;
                if (y.in_history === 0 && k === 0) {
                    s = 0
                }
                t = [];
                if (w === null) {
                    w = this.getChildren(y, u = true)
                }
                if (k && n && y.indent > 1) {
                    o = y.indent - 1;
                    for (d = 0, z = w.length; d < z; d++) {
                        i = w[d];
                        i.indent -= o
                    }
                } else {
                    if (k) {
                        if (y.indent === 1) {
                            x = 1
                        } else {
                            x = 0
                        }
                    }
                }
                v = y.in_history;
                h = this.model_data;
                j = 0;
                p = 0;
                for (c = 0, C = w.length; c < C; c++) {
                    g = w[c];
                    D = null;
                    if (v) {
                        if (k === 0) {
                            if (j === 0) {
                                D = 0
                            } else {
                                D = 1
                            }
                        }
                    } else {
                        D = k
                    } if (D !== g.checked) {
                        g.checked = D;
                        p++
                    }
                    g.in_history = x;
                    g.collapsed = 0;
                    t.push(g.id);
                    j += 1
                }
                if (p > 0) {
                    if (k === 0) {
                        Signals.sendSignal("item_uncompleted", -p)
                    } else {
                        Signals.sendSignal("item_completed", p)
                    }
                }
                SyncEngine.queueUpdate({
                    type: f,
                    args: {
                        project_id: y.project_id,
                        ids: t,
                        force_history: x,
                        update_item_orders: s
                    }
                });
                this.clearCache(y.project_id);
                ProjectsModel.updateCount(y.project_id);
                this.syncCachedData();
                return w
            }
        }
    };
    a.prototype._areArgsUpdated = function (c, f) {
        var d, h, b, g;
        g = keys(c);
        for (h = 0, b = g.length; h < b; h++) {
            d = g[h];
            if (d === "labels" || d === "due_date") {
                if ("" + c[d] !== "" + f[d]) {
                    return false
                }
            } else {
                if (c[d] !== f[d]) {
                    return false
                }
            }
        }
        return true
    };
    a.prototype._addToModel = function (c, d, b) {
        if (d == null) {
            d = true
        }
        if (b == null) {
            b = true
        }
        this.model_data[c.id] = c;
        this.clearCache(c.project_id);
        if (b) {
            return this.syncCachedData()
        }
    };
    a.prototype._sanitizeArgs = function (c) {
        var b;
        if (!c.due_date && !c.labels) {
            return c
        } else {
            b = {};
            update(b, c);
            if (b.due_date) {
                b.due_date_utc = this._formatDate(c);
                delete b.due_date
            }
            if (b.labels) {
                b.labels = serializeJSON(c.labels)
            }
            return b
        }
    };
    a.prototype._formatDate = function (b) {
        var c;
        c = DateController.jsonFormat(b.due_date, true);
        return c
    };
    a.prototype.syncCachedData = function () {
        return $storage("Items").set(this.model_data)
    };
    a.prototype.loadCachedData = function () {
        var f, c, d, b;
        d = $storage("Items").get();
        if (!d) {
            return []
        } else {
            b = [];
            for (c in d) {
                f = d[c];
                b.push(f)
            }
            return b
        }
    };
    a.prototype.loadDayOrders = function (d) {
        var g, f, b, c;
        c = [];
        for (f in d) {
            b = d[f];
            g = this.model_data[f];
            if (g) {
                c.push(g.day_order = b)
            } else {
                c.push(void 0)
            }
        }
        return c
    };
    a.prototype.convertToDateObject = function (b) {
        if (isString(b.due_date) || b.time) {
            if (b.time) {
                b.due_date = new Date(b.time)
            } else {
                b.due_date = new Date(b.due_date)
            } if (!DateController.hasTime(b.date_string)) {
                b.due_date = DateBocks.resetTimeToEnd(b.due_date)
            }
            return b.time = b.due_date.getTime()
        }
    };
    a.prototype._setNotifications = function (c) {
        var b, d;
        d = window.User.default_reminder;
        if (window.IsPremium && d !== "no_default") {
            if (c.date_string && DateController.hasTime(c.date_string)) {
                b = RemindersModel.getRemindersByItemId(c.id);
                if (b.length > 0) {
                    return
                }
                RemindersModel.add({
                    item_id: c.id,
                    service: d,
                    minute_offset: 30
                });
                return c.has_notifications = 1
            }
        }
    };
    a.prototype._getMaxOrder = function (c) {
        var d, b;
        d = getLast(this.getByProjectId(c));
        if (d) {
            b = d.item_order + 1
        } else {
            b = 1
        }
        return b
    };
    return a
})();
ItemsModel = new GItemsModel();
var GLabelsModel, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GLabelsModel = (function () {
    function a() {
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this.loadData = __bind(this.loadData, this);
        this.getLabels = __bind(this.getLabels, this);
        this.registerIfNedded = __bind(this.registerIfNedded, this);
        this.updateLabel = __bind(this.updateLabel, this);
        this.deleteLabel = __bind(this.deleteLabel, this);
        this.addLabel = __bind(this.addLabel, this);
        this.updateLabels = __bind(this.updateLabels, this);
        this.getDataLabels = __bind(this.getDataLabels, this);
        this.getById = __bind(this.getById, this);
        this.getAll = __bind(this.getAll, this);
        this.get = __bind(this.get, this)
    }
    a.prototype.re_labels = /(^|\s+)@([^\s,]+)/g;
    a.prototype.labels = {};
    a.prototype.get = function (b) {
        return this.labels[b]
    };
    a.prototype.getAll = function (d) {
        var c, g, h, f, b;
        if (d == null) {
            d = false
        }
        h = values(this.labels);
        if (d && window.QueriesComplex) {
            for (f = 0, b = h.length; f < b; f++) {
                c = h[f];
                c.count = QueriesComplex.getByLabels([c.id], true)
            }
            g = function (j, i) {
                if (j.count === i.count) {
                    return j.name.toLowerCase() > i.name.toLowerCase()
                } else {
                    return i.count - j.count
                }
            };
            h.sort(g)
        }
        return h
    };
    a.prototype.getById = function (f) {
        var c, b, d;
        f = TemporaryIds.getRealId(f);
        d = this.labels;
        for (b in d) {
            c = d[b];
            if (c.id === f) {
                return c
            }
        }
        return null
    };
    a.prototype.getDataLabels = function (c) {
        var i, g, h, f, b, d;
        if (!c.labels) {
            return []
        }
        h = [];
        d = c.labels;
        for (f = 0, b = d.length; f < b; f++) {
            i = d[f];
            g = this.getById(i);
            if (g) {
                h.push("@" + g.name)
            }
        }
        return h
    };
    a.prototype.updateLabels = function (j, l) {
        var h, b, g, i, f, c, k, d;
        if (j.content === void 0) {
            return
        }
        this.registerIfNedded(j.content);
        d = this.getLabels(j.content), h = d[0], f = d[1];
        b = [];
        for (c = 0, k = f.length; c < k; c++) {
            g = f[c];
            i = this.get(g);
            if (i) {
                b.push(i.id)
            }
        }
        j.labels = b;
        j.content = h;
        l.labels = b;
        return l.content = h
    };
    a.prototype.addLabel = function (d) {
        var c, b, f = this;
        c = {
            name: d,
            color: 0
        };
        this.labels[c.name.toLowerCase()] = c;
        b = c.id = TemporaryIds.generate();
        TemporaryIds.listen(b, function (g, o) {
            var l, n, k, i, m, j, h;
            c.id = o;
            j = ItemsModel.getAll();
            h = [];
            for (i = 0, m = j.length; i < m; i++) {
                n = j[i];
                k = n.labels;
                if (k.length > 0) {
                    l = getIndex(g, k);
                    if (l !== -1) {
                        h.push(k.splice(l, 1, o))
                    } else {
                        h.push(void 0)
                    }
                } else {
                    h.push(void 0)
                }
            }
            return h
        });
        SyncEngine.queueUpdate({
            type: "label_register",
            temp_id: b,
            args: {
                name: d
            }
        });
        this.syncCachedData();
        return c
    };
    a.prototype.deleteLabel = function (c) {
        var b;
        b = this.getById(c);
        if (b) {
            delete this.labels[b.name.toLowerCase()];
            SyncEngine.queueUpdate({
                type: "label_delete",
                args: {
                    id: b.id
                }
            });
            return this.syncCachedData()
        }
    };
    a.prototype.updateLabel = function (f, d) {
        var c, b;
        c = this.getById(f);
        if (c) {
            d.id = c.id;
            if (d.name) {
                b = c.name.toLowerCase();
                if (this.labels[b]) {
                    delete this.labels[b]
                }
                this.labels[d.name.toLowerCase()] = c;
                c.name = d.name
            }
            SyncEngine.queueUpdate({
                type: "label_update",
                args: d
            });
            return this.syncCachedData()
        }
    };
    a.prototype.registerIfNedded = function (h) {
        var i, g, b, k, d, j, f, c;
        f = this.getLabels(h, b = true), k = f[0], g = f[1];
        c = [];
        for (d = 0, j = g.length; d < j; d++) {
            i = g[d];
            c.push(this.addLabel(i))
        }
        return c
    };
    a.prototype.getLabels = function (d, c) {
        var g, b, f = this;
        if (c == null) {
            c = false
        }
        g = [];
        b = function (k, i, h) {
            var j;
            h = h.toLowerCase();
            j = f.get(h);
            if (c) {
                if (!j) {
                    g.push(h)
                }
            } else {
                g.push(h)
            }
            return ""
        };
        d = d.replace(this.re_labels, b);
        return [d, g]
    };
    a.prototype.loadData = function (g) {
        var d, f, c, b;
        if (g) {
            this.labels = {};
            b = [];
            for (f = 0, c = g.length; f < c; f++) {
                d = g[f];
                b.push(this.labels[d.name.toLowerCase()] = d)
            }
            return b
        }
    };
    a.prototype.syncCachedData = function () {
        return $storage("Labels").set(this.labels)
    };
    a.prototype.loadCachedData = function () {
        var d, c, f, b;
        f = $storage("Labels").get();
        if (!f) {
            return []
        } else {
            b = [];
            for (c in f) {
                d = f[c];
                b.push(d)
            }
            return b
        }
    };
    return a
})();
window.LabelsModel = new GLabelsModel();
var GItemsQueries;
GItemsQueries = (function () {
    function a() {}
    a.prototype.getCounts = function () {
        var g, c, f, b, d;
        g = {
            today: this.getToday().length,
            overdue: this.getOverdue().length,
            priority1: 0,
            priority2: 0,
            priority3: 0
        };
        d = ItemsModel.getAll();
        for (f = 0, b = d.length; f < b; f++) {
            c = d[f];
            if (c.priority === 4) {
                g.priority1++
            } else {
                if (c.priority === 3) {
                    g.priority2++
                } else {
                    if (c.priority === 2) {
                        g.priority3++
                    }
                }
            }
        }
        return g
    };
    a.prototype.getToday = function () {
        return this.getByDate(DateBocks.getNow())
    };
    a.prototype.getOverdue = function (f) {
        var i, g, b, d, h, c;
        if (f == null) {
            f = null
        }
        if (!f) {
            f = ItemsModel.getAll()
        }
        b = [];
        d = DateBocks.getNow();
        for (h = 0, c = f.length; h < c; h++) {
            g = f[h];
            i = g.due_date;
            if (i && DateController.isOverdue(d, i)) {
                if (!DateController.sameDate(d, i)) {
                    b.push(g)
                }
            }
        }
        b.sort(function (k, j) {
            return k.time - j.time
        });
        return b
    };
    a.prototype.getNextXdays = function (c, j, h) {
        var d, b, i, l, g, f, k;
        if (c == null) {
            c = false
        }
        if (j == null) {
            j = 7
        }
        if (h == null) {
            h = null
        }
        if (!h) {
            h = ItemsModel.getAll()
        }
        b = [];
        for (i = g = 0; 0 <= j ? g <= j : g >= j; i = 0 <= j ? ++g : --g) {
            b.push(DateBocks.magicDate("+" + i))
        }
        l = {};
        for (f = 0, k = b.length; f < k; f++) {
            d = b[f];
            l[d] = this.getByDate(d, h)
        }
        if (c) {
            return flattenList(values(l))
        } else {
            return l
        }
    };
    a.prototype.getByDate = function (f, d) {
        var g, b, h, c;
        if (d == null) {
            d = null
        }
        if (!d) {
            d = ItemsModel.getAll()
        }
        b = [];
        for (h = 0, c = d.length; h < c; h++) {
            g = d[h];
            if (g.due_date && DateController.sameDate(g.due_date, f)) {
                b.push(g)
            }
        }
        return b
    };
    return a
})();
window.ItemsQueries = new GItemsQueries();
var GQuerySearch;
GQuerySearch = (function () {
    function a() {}
    a.prototype.search = function (m, l) {
        var j, h, n, k, b, i, p, d, g, f, o, c;
        if (l == null) {
            l = null
        }
        if (!l) {
            l = ItemsModel.getAll()
        }
        m = strip(m).toLowerCase();
        if (m === "") {
            return []
        }
        i = m.split(/\s+/g);
        i = (function () {
            var s, r, q;
            q = [];
            for (s = 0, r = i.length; s < r; s++) {
                b = i[s];
                q.push(new RegExp(b, "i"))
            }
            return q
        })();
        j = function (r) {
            var s, q;
            for (s = 0, q = i.length; s < q; s++) {
                b = i[s];
                if (!r.match(b)) {
                    return false
                }
            }
            return true
        };
        p = [];
        for (g = 0, o = l.length; g < o; g++) {
            d = l[g];
            h = false;
            if (j(d.content)) {
                h = true
            }
            k = NotesModel.getNotes(d.id);
            for (f = 0, c = k.length; f < c; f++) {
                n = k[f];
                if (j(n.content)) {
                    h = true
                }
            }
            if (h) {
                p.push(d)
            }
        }
        return p
    };
    return a
})();
window.QuerySearch = new GQuerySearch();
var GProjectsModel, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GProjectsModel = (function () {
    function a() {
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this.updateCached = __bind(this.updateCached, this);
        this.updateOrdersIndents = __bind(this.updateOrdersIndents, this);
        this.updateCount = __bind(this.updateCount, this);
        this.update = __bind(this.update, this);
        this.deleteFromModel = __bind(this.deleteFromModel, this);
        this.deleteProjects = __bind(this.deleteProjects, this);
        this.add = __bind(this.add, this);
        this.loadData = __bind(this.loadData, this);
        this.clearArchivedProjects = __bind(this.clearArchivedProjects, this);
        this.updateTimestamps = __bind(this.updateTimestamps, this);
        this.getTimestamps = __bind(this.getTimestamps, this);
        this.getChildren = __bind(this.getChildren, this);
        this.getItemCount = __bind(this.getItemCount, this);
        this.getAll = __bind(this.getAll, this);
        this.getIds = __bind(this.getIds, this);
        this.get = __bind(this.get, this)
    }
    a.prototype.max_limit = 80;
    a.prototype.model_loaded = false;
    a.prototype.model_data = {};
    a.prototype.get = function (b) {
        return this.model_data[b]
    };
    a.prototype.getIds = function () {
        return keys(this.model_data)
    };
    a.prototype.getAll = function () {
        var d, c, b;
        b = (function () {
            var g, f;
            g = this.model_data;
            f = [];
            for (d in g) {
                c = g[d];
                f.push(c)
            }
            return f
        }).call(this);
        b.sort(UtilModels.sortByItemOrder);
        return b
    };
    a.prototype.getItemCount = function (d) {
        var g, f, c, h, b;
        c = ItemsModel.getByProjectId(d);
        g = 0;
        for (h = 0, b = c.length; h < b; h++) {
            f = c[h];
            if (f.checked === 0 && !isBulletItem(f.content)) {
                g += 1
            }
        }
        return g
    };
    a.prototype.getChildren = function (c, d) {
        var b;
        if (d == null) {
            d = false
        }
        b = this.getAll();
        return UtilModels.getChildren(b, c, d)
    };
    a.prototype.getTimestamps = function () {
        var f, c, d, b;
        if (this.model_loaded) {
            c = this.model_data
        } else {
            c = $storage("Projects").get()
        }
        b = {};
        for (f in c) {
            d = c[f];
            b[f] = d.last_updated
        }
        return b
    };
    a.prototype.updateTimestamps = function (b) {
        var c, f, d;
        for (c in b) {
            d = b[c];
            f = this.model_data[c];
            if (f) {
                f.last_updated = d
            }
        }
        this.clearArchivedProjects();
        return this.syncCachedData()
    };
    a.prototype.clearArchivedProjects = function () {
        var b, c, k, j, i, f, h, g, d;
        c = [];
        g = this.model_data;
        for (b in g) {
            i = g[b];
            if (i.is_archived) {
                c.push(b)
            }
        }
        j = this.model_data;
        d = [];
        for (f = 0, h = c.length; f < h; f++) {
            k = c[f];
            if (j[k]) {
                d.push(delete j[k])
            } else {
                d.push(void 0)
            }
        }
        return d
    };
    a.prototype.loadData = function (c) {
        var f, d, b;
        for (d = 0, b = c.length; d < b; d++) {
            f = c[d];
            this.model_data[f.id] = f;
            if (f.inbox_project) {
                f.name = _("Inbox")
            }
            f.name = strip(f.name.replace(/^\*/, ""))
        }
        this.syncCachedData();
        return this.model_loaded = true
    };
    a.prototype.add = function (c) {
        var d, f, b, g = this;
        f = {
            user_id: UserId,
            color: 1,
            collapsed: 0,
            indent: c.indent || 1,
            cache_count: 0
        };
        d = this.getAll();
        if (d.length >= this.max_limit) {
            alert(_("For performance reasons you can only add %s projects. Please archive or delete some of your finished projects.").replace("%s", this.max_limit));
            return
        }
        if (d.length > 0) {
            f.item_order = getLast(d).item_order + 1
        } else {
            f.item_order = 1
        }
        update(f, c);
        b = f.id = TemporaryIds.generate();
        TemporaryIds.listen(b, function (i, h) {
            f.id = h;
            g.model_data[f.id] = f;
            if (g.model_data[i]) {
                delete g.model_data[i]
            }
            return g.syncCachedData()
        });
        SyncEngine.queueUpdate({
            type: "project_add",
            temp_id: b,
            args: c
        });
        this.model_data[f.id] = f;
        this.syncCachedData();
        return f
    };
    a.prototype.deleteProjects = function (c) {
        var f, d, b;
        SyncEngine.queueUpdate({
            type: "project_delete",
            args: {
                ids: c
            }
        });
        for (d = 0, b = c.length; d < b; d++) {
            f = c[d];
            this.deleteFromModel(f)
        }
        ItemsModel.syncCachedData();
        return this.syncCachedData()
    };
    a.prototype.deleteFromModel = function (b) {
        if (this.model_data[b]) {
            delete this.model_data[b]
        }
        return ItemsModel.deleteCacheByProjectId(b)
    };
    a.prototype.update = function (d, b) {
        var c;
        c = this.get(d);
        if (c) {
            update(c, b);
            b.id = c.id;
            SyncEngine.queueUpdate({
                type: "project_update",
                args: b
            });
            if (b.name) {
                Signals.sendSignal("project.name.changed", c)
            }
            this.syncCachedData();
            return c
        }
    };
    a.prototype.updateCount = function (c) {
        var b;
        b = this.get(c);
        if (b) {
            b.cache_count = this.getItemCount(b.id);
            Signals.sendSignal("update_project_count", b);
            return this.syncCachedData()
        }
    };
    a.prototype.updateOrdersIndents = function (f) {
        var d, b, g, c;
        b = false;
        for (g in f) {
            d = f[g];
            c = this.model_data[g];
            if (c) {
                c.item_order = d[0];
                c.indent = d[1];
                b = true
            }
        }
        if (b) {
            SyncEngine.queueUpdate({
                type: "project_update_orders_indents",
                args: {
                    ids_to_orders_indents: serializeJSON(f)
                }
            });
            return this.syncCachedData()
        }
    };
    a.prototype.updateCached = function (c, b) {
        var d;
        c.id = TemporaryIds.getRealId(c.id);
        d = this.get(c.id);
        if (d) {
            update(d, b)
        }
        return update(c, b)
    };
    a.prototype.syncCachedData = function () {
        return $storage("Projects").set(this.model_data)
    };
    a.prototype.loadCachedData = function () {
        var b;
        b = $storage("Projects").get();
        if (!b) {
            return []
        } else {
            return values(b)
        }
    };
    return a
})();
window.ProjectsModel = new GProjectsModel();
var GNotificationsModel, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GNotificationsModel = (function () {
    function a() {
        this.doInvitationGeneric = __bind(this.doInvitationGeneric, this);
        this.rejectInvitation = __bind(this.rejectInvitation, this);
        this.acceptInvitation = __bind(this.acceptInvitation, this);
        this.getNotifications = __bind(this.getNotifications, this);
        this.updateCount = __bind(this.updateCount, this)
    }
    a.prototype.unread_count = -1;
    a.prototype.updateCount = function (b) {
        return Signals.sendSignal("notifications_updated", b)
    };
    a.prototype.getNotifications = function (h, b, g) {
        var c, d, f;
        if (g == null) {
            g = null
        }
        d = keys(Collaborators.collaborators);
        c = {
            known_uids: serializeJSON(d),
            mark_as_read: "true",
            token: User.token
        };
        if (g) {
            c.offset = g
        }
        f = loadJSON("/API/LiveNotifications/getNotifications");
        f.offline_message = true;
        f.addCallback(h);
        f.addErrback(b);
        return f.sendReq(c)
    };
    a.prototype.acceptInvitation = function (d, f, b) {
        var c;
        c = "/API/Sharing/acceptInvitation";
        return this.doInvitationGeneric(c, d, f, b)
    };
    a.prototype.rejectInvitation = function (d, f, b) {
        var c;
        c = "/API/Sharing/rejectInvitation";
        return this.doInvitationGeneric(c, d, f, b)
    };
    a.prototype.doInvitationGeneric = function (d, g, i, b) {
        var c, f, h = this;
        c = {
            token: window.User.token,
            id: g.invitation_id,
            secret: g.invitation_secret
        };
        f = loadJSON(d);
        f.offline_message = true;
        f.addCallback(function (k) {
            var j, l;
            l = function () {
                ProjectList.insertItems(ProjectsModel.getAll());
                if (i) {
                    return i(k)
                }
            };
            j = {
                onSuccess: l,
                onError: b
            };
            return SyncEngine.sync(j, true)
        });
        f.addErrback(b);
        return f.sendReq(c)
    };
    return a
})();
window.NotificationsModel = new GNotificationsModel();
var GCollaborators, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GCollaborators = (function () {
    function a() {
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this.loadData = __bind(this.loadData, this);
        this.getUserById = __bind(this.getUserById, this)
    }
    a.prototype.collaborators = {};
    a.prototype.getUserById = function (b) {
        return this.collaborators[b]
    };
    a.prototype.loadData = function (b) {
        update(this.collaborators, b);
        return this.syncCachedData()
    };
    a.prototype.syncCachedData = function () {
        return $storage("Collaborators").set(this.collaborators)
    };
    a.prototype.loadCachedData = function () {
        var b;
        b = $storage("Collaborators").get();
        if (!b) {
            return []
        } else {
            return b
        }
    };
    return a
})();
window.Collaborators = new GCollaborators();
var GBufferedRemindersModel, GRemindersModel, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GRemindersModel = (function () {
    function a() {
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this.loadData = __bind(this.loadData, this);
        this.remove = __bind(this.remove, this);
        this.add = __bind(this.add, this);
        this.getRemindersByItemId = __bind(this.getRemindersByItemId, this)
    }
    a.prototype.reminders_by_id = {};
    a.prototype.getRemindersByItemId = function (f) {
        var d, b, h, c, g;
        f = TemporaryIds.getRealId(f);
        b = [];
        g = values(this.reminders_by_id);
        for (h = 0, c = g.length; h < c; h++) {
            d = g[h];
            if (d.item_id === f) {
                b.push(d)
            }
        }
        return b
    };
    a.prototype.add = function (d) {
        var c, b, f = this;
        c = {};
        b = c.id = TemporaryIds.generate();
        this.reminders_by_id[b] = c;
        TemporaryIds.listen(b, function (h, g) {
            c.id = g;
            if (f.reminders_by_id[h]) {
                delete f.reminders_by_id[h]
            }
            return f.reminders_by_id[g] = c
        });
        update(c, d);
        SyncEngine.queueUpdate({
            type: "reminder_add",
            args: d,
            temp_id: b
        });
        this.syncCachedData();
        return c
    };
    a.prototype.remove = function (b) {
        b = TemporaryIds.getRealId(b);
        if (this.reminders_by_id[b]) {
            delete this.reminders_by_id[b]
        }
        SyncEngine.queueUpdate({
            type: "reminder_delete",
            args: {
                id: b
            }
        });
        return this.syncCachedData()
    };
    a.prototype.loadData = function (c) {
        var l, i, j, g, f, k, b, h, d;
        this.reminders_by_id = c;
        h = ItemsModel.getAll();
        for (g = 0, k = h.length; g < k; g++) {
            l = h[g];
            l.has_notifications = 0
        }
        i = ItemsModel.model_data;
        d = values(this.reminders_by_id);
        for (f = 0, b = d.length; f < b; f++) {
            j = d[f];
            l = i[j.item_id];
            if (l) {
                l.has_notifications = 1
            }
        }
        return this.syncCachedData()
    };
    a.prototype.syncCachedData = function () {
        return $storage("Reminders").set(this.reminders_by_id)
    };
    a.prototype.loadCachedData = function () {
        var b;
        b = $storage("Reminders").get();
        if (b) {
            return this.reminders_by_id = b
        } else {
            return this.reminders_by_id = {}
        }
    };
    return a
})();
GBufferedRemindersModel = (function () {
    function a() {
        this.commitBuffered = __bind(this.commitBuffered, this);
        this.getCurItem = __bind(this.getCurItem, this)
    }
    a.prototype.use_buffered = false;
    a.prototype.cur_item = null;
    a.prototype.reminders = [];
    a.prototype.getCurItem = function () {
        var c, b;
        b = {};
        if (this.cur_item) {
            update(b, this.cur_item)
        } else {
            b.id = "_buf_rem"
        }
        c = $bytc("input", "input_due_date");
        if (c.length > 0) {
            b.date_string = c[0].value
        }
        return b
    };
    a.prototype.commitBuffered = function (c) {
        var g, f, b, d;
        if (this.reminders.length > 0) {
            d = this.reminders;
            for (f = 0, b = d.length; f < b; f++) {
                g = d[f];
                g.item_id = c.id;
                RemindersModel.add(g)
            }
            return c.has_notifications = true
        }
    };
    a.prototype.getRemindersByItemId = function (b) {
        if (this.use_buffered) {
            return this.reminders
        } else {
            return RemindersModel.getRemindersByItemId(b)
        }
    };
    a.prototype.add = function (b) {
        if (this.use_buffered) {
            this.reminders.push(b)
        } else {
            RemindersModel.add(b)
        }
        return b
    };
    a.prototype.remove = function (h) {
        var f, g, d, b, c;
        if (this.use_buffered) {
            f = [];
            c = this.reminders;
            for (d = 0, b = c.length; d < b; d++) {
                g = c[d];
                if (g.id !== h) {
                    f.push(g)
                }
            }
            return this.reminders = f
        } else {
            return RemindersModel.remove(h)
        }
    };
    a.prototype.reset = function () {
        this.reminders = [];
        this.cur_item = null;
        return this.use_buffered = false
    };
    return a
})();
window.RemindersModel = new GRemindersModel();
window.BufferedRemindersModel = new GBufferedRemindersModel();
var GLoadEngine, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GLoadEngine = (function () {
    function a() {
        this.checkVersion = __bind(this.checkVersion, this);
        this.checkIfErrorIsLogout = __bind(this.checkIfErrorIsLogout, this);
        this.getTimestamps = __bind(this.getTimestamps, this);
        this.getCollaboratorsTimestamp = __bind(this.getCollaboratorsTimestamp, this);
        this.getRemindersTimestamp = __bind(this.getRemindersTimestamp, this);
        this.getDayOrdersTimestamp = __bind(this.getDayOrdersTimestamp, this);
        this.getLabelsTimestamp = __bind(this.getLabelsTimestamp, this);
        this.clearLocalData = __bind(this.clearLocalData, this);
        this.forceLoadAllData = __bind(this.forceLoadAllData, this);
        this.loadData = __bind(this.loadData, this)
    }
    a.prototype.initial_load = true;
    a.prototype.loadCachedData = function () {
        LabelsModel.loadData(LabelsModel.loadCachedData());
        ProjectsModel.loadData(ProjectsModel.loadCachedData());
        ItemsModel.loadData(ItemsModel.loadCachedData());
        Collaborators.loadData(Collaborators.loadCachedData());
        RemindersModel.loadData(RemindersModel.loadCachedData());
        return NotesModel.loadCachedData()
    };
    a.prototype.loadData = function (b, i) {
        var g, f, d, c, h = this;
        SyncEngineExt.loadCachedData();
        f = loadJSON("/TodoistSync/v4/syncAndGetUpdatedFast");
        f.addCallback(function (j) {
            SyncEngine.sync_queue.clear();
            h.loadCachedData();
            SyncData.syncLocalData(j, true);
            SyncEngineExt.syncData(j);
            h.checkVersion(j);
            if (isFunction(i)) {
                return i(true)
            }
        });
        f.addErrback(function (j) {
            if (h.checkIfErrorIsLogout(j)) {
                return
            }
            if (!b) {
                alert(_("Could not sync with Todoist. Will go into offline mode and try to sync again later."))
            }
            window.Settings = $storage("Settings").get();
            window.UserId = $storage("UserId").get();
            window.User = $storage("User").get();
            if (window.Settings) {
                DateBocks.us_dates = window.Settings.US_DATES
            } else {
                DateBocks.us_dates = true
            }
            h.loadCachedData();
            Signals.sendSignal("sync_state_changed");
            if (isFunction(i)) {
                return i(false)
            }
        });
        if (b) {
            g = null
        } else {
            g = this.getTimestamps()
        }
        d = {
            project_timestamps: serializeJSON(g),
            labels_timestamp: this.getLabelsTimestamp(),
            day_orders_timestamp: this.getDayOrdersTimestamp(),
            reminders_timestamp: this.getRemindersTimestamp(),
            with_web_static_version: 1,
            include_on_none: 1,
            seq_no: SyncEngineExt.seq_no || 0
        };
        c = SyncEngine.sync_queue.get();
        if (c.length > 0) {
            SyncEngine.sync_queue.assignUnqiueIds(c);
            d.items_to_sync = serializeJSON(c)
        }
        if (LoginEngine.token) {
            d.api_token = LoginEngine.token
        }
        return f.sendReq(d)
    };
    a.prototype.forceLoadAllData = function (b) {
        var c, d = this;
        if (b == null) {
            b = false
        }
        Scroller.scrollToTop();
        Overlay.showIndicator();
        c = function () {
            return d.loadData(b, function () {
                if (b) {
                    return window.location.reload()
                } else {
                    d.req = null;
                    LocationManager.refreshView();
                    return setTimeout(function () {
                        return SyncEngine.sync(null, true)
                    }, 100)
                }
            })
        };
        SyncEngine.cancelSyncIfNeeded();
        SyncEngine.maybeNeedsSyncing(0, {
            onSuccess: c,
            onError: c
        });
        return false
    };
    a.prototype.clearLocalData = function () {
        $storage("Settings").remove();
        $storage("Labels").remove();
        $storage("LabelsTimestamp").remove();
        $storage("DayOrdersTimestamp").remove();
        $storage("RemindersTimestamp").remove();
        $storage("CollaboratorsTimestamp").remove();
        $storage("Items").remove();
        $storage("Projects").remove();
        $storage("User").remove();
        $storage("Notes").remove();
        $storage("TimestampSN").remove();
        $storage("Reminders").remove();
        ItemsModel.model_data = {};
        ProjectsModel.model_data = {};
        return LabelsModel.labels = []
    };
    a.prototype.getLabelsTimestamp = function () {
        return $storage("LabelsTimestamp").get() || ""
    };
    a.prototype.getDayOrdersTimestamp = function () {
        return $storage("DayOrdersTimestamp").get() || ""
    };
    a.prototype.getRemindersTimestamp = function () {
        return $storage("RemindersTimestamp").get() || ""
    };
    a.prototype.getCollaboratorsTimestamp = function () {
        return $storage("CollaboratorsTimestamp").get() || ""
    };
    a.prototype.getTimestamps = function () {
        var f, c, d, b;
        if (this.initial_load) {
            c = $storage("Projects").get()
        } else {
            c = ProjectsModel.model_data
        }
        this.initial_load = false;
        b = {};
        for (f in c) {
            d = c[f];
            b[f] = d.last_updated
        }
        return b
    };
    a.prototype.checkIfErrorIsLogout = function (c) {
        var b;
        b = false;
        if (c.indexOf("Not logged in") !== -1) {
            b = true
        }
        if (c.indexOf("Token not correct") !== -1) {
            b = true
        }
        if (c.indexOf("403 Forbidden") !== -1) {
            b = true
        }
        if (b) {
            alert(_("It seems like our session has expired. Please re-login."), function () {
                LoginEngine.logout();
                if (window.IS_MINI) {
                    return window.location = "/?mini=1"
                } else {
                    return window.location = "/"
                }
            });
            return true
        }
    };
    a.prototype.checkVersion = function (d) {
        var c, f, b;
        c = getQueryArgument("v");
        b = d.WebStaticVersion;
        if (c && b) {
            c = parseInt(c);
            if (c !== b) {
                try {
                    if (window.applicationCache) {
                        window.applicationCache.update()
                    }
                } catch (g) {
                    f = g;
                    null
                }
                window.location = window.location.href.replace(/v=\d+/, "v=" + b);
                return false
            }
        }
        return true
    };
    return a
})();
window.LoadEngine = new GLoadEngine();
var GSyncQueue, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GSyncQueue = (function () {
    function a() {
        this.clear = __bind(this.clear, this);
        this.deleteItems = __bind(this.deleteItems, this);
        this.save = __bind(this.save, this);
        this.assignUnqiueIds = __bind(this.assignUnqiueIds, this);
        this.add = __bind(this.add, this);
        this.get = __bind(this.get, this);
        this.unique_id = (new Date()).getTime();
        if (!this.get()) {
            this.clear()
        }
    }
    a.prototype.get = function () {
        return $storage("Queue").get()
    };
    a.prototype.add = function (b) {
        var c;
        c = this.get();
        if (!b.timestamp) {
            b.timestamp = ++this.unique_id
        }
        c.push(b);
        return this.save(c)
    };
    a.prototype.assignUnqiueIds = function (b) {
        var f, d, g, c;
        d = false;
        for (g = 0, c = b.length; g < c; g++) {
            f = b[g];
            if (!f.timestamp) {
                f.timestamp = ++this.unique_id;
                d = true
            }
        }
        if (d) {
            return this.save(b)
        }
    };
    a.prototype.save = function (b) {
        return $storage("Queue").set(b)
    };
    a.prototype.deleteItems = function (c) {
        var g, h, d, f, b;
        g = this.get();
        for (f = 0, b = c.length; f < b; f++) {
            d = c[f];
            h = function (i) {
                return i.timestamp === d.timestamp
            };
            arrayRemove(g, d, h)
        }
        return this.save(g)
    };
    a.prototype.clear = function () {
        return $storage("Queue").set([])
    };
    return a
})();
var GSyncEngine, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GSyncEngine = (function () {
    a.prototype.sync_states = {
        all_synced: 1,
        syncing: 2,
        needs_sync: 3
    };

    function a() {
        this._setSyncState = __bind(this._setSyncState, this);
        this._allSynced = __bind(this._allSynced, this);
        this.setUpdateTimeout = __bind(this.setUpdateTimeout, this);
        this.sync = __bind(this.sync, this);
        this.getQueueLength = __bind(this.getQueueLength, this);
        this.getSyncState = __bind(this.getSyncState, this);
        this.maybeNeedsSyncing = __bind(this.maybeNeedsSyncing, this);
        this.cancelSyncIfNeeded = __bind(this.cancelSyncIfNeeded, this);
        this.queueUpdate = __bind(this.queueUpdate, this);
        this.sync_queue = new GSyncQueue();
        this.maybeNeedsSyncing();
        this.number_of_errors = 0
    }
    a.prototype.queueUpdate = function (b) {
        this.sync_queue.add(b);
        return this.maybeNeedsSyncing()
    };
    a.prototype.cancelSyncIfNeeded = function () {
        if (this.current_req) {
            this.current_req.abort();
            this.current_req = null
        }
        if (this.getQueueLength() > 0) {
            return this.maybeNeedsSyncing()
        } else {
            return this._allSynced()
        }
    };
    a.prototype.maybeNeedsSyncing = function (b, d, c) {
        if (b == null) {
            b = null
        }
        if (d == null) {
            d = null
        }
        if (c == null) {
            c = false
        }
        if (!b) {
            if (window.IS_MINI) {
                b = 300
            } else {
                b = 1000
            }
        }
        if (this.getQueueLength() === 0) {
            this._allSynced();
            this.sync(d)
        } else {
            this.setUpdateTimeout(b, d)
        }
        return false
    };
    a.prototype.getSyncState = function () {
        return this.sync_state
    };
    a.prototype.getQueueLength = function () {
        return this.sync_queue.get().length
    };
    a.prototype.sync = function (b, c) {
        var k, j, h, d, f, i, g = this;
        if (b == null) {
            b = null
        }
        if (c == null) {
            c = false
        }
        if (this.getQueueLength() === 0 && c === false) {
            if (b && b.onSuccess) {
                b.onSuccess()
            }
            return this._allSynced()
        }
        this._setSyncState(this.sync_states.syncing);
        k = this.sync_queue.get();
        this.sync_queue.assignUnqiueIds(k);
        d = arrayCopy(k);
        this.current_req = h = loadJSON("/TodoistSync/v4/syncAndGetUpdated");
        h.addCallback(function (l) {
            g.number_of_errors = 0;
            g.current_req = null;
            g.sync_queue.deleteItems(d);
            g._allSynced();
            if (g.getQueueLength() === 0) {
                SyncData.syncLocalData(l, false);
                SyncEngineExt.syncData(l);
                if (l.Projects.length > 0) {
                    Signals.sendSignal("refresh_interface", l.Projects)
                }
            } else {
                SyncEngine.maybeNeedsSyncing()
            } if (b && b.onSuccess) {
                return b.onSuccess()
            }
        });
        h.addErrback(function (m) {
            var l, n;
            if (LoadEngine.checkIfErrorIsLogout(m)) {
                return
            }
            g._setSyncState(g.sync_states.needs_sync);
            g.current_req = null;
            g.number_of_errors++;
            n = g.number_of_errors * 5000;
            if (n > 60000) {
                n = 60000
            }
            g.timeout = n;
            g.maybeNeedsSyncing(n, null, l = true);
            if (b && b.onError) {
                return b.onError()
            }
        });
        for (f = 0, i = d.length; f < i; f++) {
            j = d[f];
            this._setRealIds(j)
        }
        return h.sendReq({
            items_to_sync: serializeJSON(d),
            project_timestamps: serializeJSON(LoadEngine.getTimestamps()),
            labels_timestamp: LoadEngine.getLabelsTimestamp(),
            day_orders_timestamp: LoadEngine.getDayOrdersTimestamp(),
            reminders_timestamp: LoadEngine.getRemindersTimestamp(),
            collaborators_timestamp: LoadEngine.getCollaboratorsTimestamp(),
            api_token: LoginEngine.token,
            disable_automatic_notifications: 1,
            seq_no: SyncEngineExt.seq_no || 0
        })
    };
    a.prototype.setUpdateTimeout = function (b, c) {
        var d, f = this;
        if (b == null) {
            b = 500
        }
        if (c == null) {
            c = null
        }
        if (this._update_timeout) {
            clearTimeout(this._update_timeout)
        }
        d = function () {
            return f.sync(c)
        };
        return this._update_timeout = setTimeout(d, b)
    };
    a.prototype._allSynced = function () {
        return this._setSyncState(this.sync_states.all_synced)
    };
    a.prototype._setSyncState = function (b) {
        this.sync_state = b;
        return Signals.sendSignal("sync_state_changed")
    };
    a.prototype._setRealIds = function (f) {
        var c, i, d, h, g, b;
        c = TemporaryIds.getRealId;
        if (f.temp_id) {
            f.temp_id = c(f.temp_id)
        }
        g = f.args;
        b = [];
        for (d in g) {
            h = g[d];
            switch (d) {
            case "id":
                b.push(f.args.id = c(f.args.id));
                break;
            case "ids":
                b.push(f.args.ids = (function () {
                    var m, k, j, l;
                    j = f.args.ids;
                    l = [];
                    for (m = 0, k = j.length; m < k; m++) {
                        i = j[m];
                        l.push(c(i))
                    }
                    return l
                })());
                break;
            case "project_id":
                b.push(f.project_id = c(f.project_id));
                break;
            default:
                b.push(void 0)
            }
        }
        return b
    };
    return a
})();
window.SyncEngine = new GSyncEngine();
var GSyncEngineExt, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GSyncEngineExt = (function () {
    function a() {
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this.syncData = __bind(this.syncData, this)
    }
    a.prototype.syncData = function (b) {
        if (b.seq_no) {
            this.seq_no = b.seq_no;
            this.syncCachedData()
        }
        if (b.Notes) {
            return NotesModel.syncLocalModel(b.Notes)
        }
    };
    a.prototype.syncCachedData = function () {
        return $storage("TimestampSN").set(this.seq_no)
    };
    a.prototype.loadCachedData = function () {
        var b, c;
        c = $storage("TimestampSN").get();
        if (c) {
            return this.seq_no = c
        } else {
            return b = 0
        }
    };
    return a
})();
window.SyncEngineExt = new GSyncEngineExt();
var GSyncData, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GSyncData = (function () {
    function a() {
        this.syncLocalData = __bind(this.syncLocalData, this)
    }
    a.prototype.syncLocalData = function (D, y) {
        var r, v, m, l, d, z, u, t, w, s, q, J, j, F, o, x, N, k, M, h, g, f, c, H, K, I, G, E, C, b, L, n, i;
        if (y == null) {
            y = false
        }
        LoadEngine.fetched_data_from_server = true;
        k = D.TempIdMapping;
        TemporaryIds.setRealIds(k);
        v = false;
        o = D.Projects;
        if (o.length > 0) {
            v = true;
            x = ProjectsModel.model_data;
            t = ItemsModel.model_data;
            F = {};
            for (h = 0, H = o.length; h < H; h++) {
                s = o[h];
                F[s.id] = true
            }
            w = [];
            for (u in t) {
                z = t[u];
                if (F[z.project_id]) {
                    w.push(z.id)
                }
            }
            for (g = 0, K = w.length; g < K; g++) {
                u = w[g];
                if (t[u]) {
                    delete t[u]
                }
            }
            for (f = 0, I = o.length; f < I; f++) {
                j = o[f];
                n = j.items;
                for (c = 0, G = n.length; c < G; c++) {
                    z = n[c];
                    ItemsModel.convertToDateObject(z);
                    t[z.id] = z
                }
                j.cache_count = j.items.length;
                delete j.items;
                x[j.id] = j;
                J = TemporaryIds.getTempId(j.id);
                if (J) {
                    ItemsModel.deleteCacheByProjectId(J, false);
                    if (x[J]) {
                        delete x[J]
                    }
                }
            }
        }
        if (k && keys(k).length > 0) {
            ItemsModel.resolveTempIds(k)
        }
        window.Settings = D.Settings;
        window.UserId = D.UserId;
        window.User = D.User;
        DateBocks.us_dates = D.Settings.US_DATES;
        if (D.LabelsTimestamp) {
            $storage("LabelsTimestamp").set(D.LabelsTimestamp)
        }
        if (D.Labels) {
            LabelsModel.loadData(D.Labels);
            LabelsModel.syncCachedData()
        }
        if (D.DayOrdersTimestamp) {
            $storage("DayOrdersTimestamp").set(D.DayOrdersTimestamp)
        }
        if (D.CollaboratorsTimestamp) {
            $storage("CollaboratorsTimestamp").set(D.CollaboratorsTimestamp)
        }
        if (D.DayOrders) {
            ItemsModel.loadDayOrders(D.DayOrders)
        }
        if (y) {
            $storage("Settings").set(D.Settings);
            $storage("UserId").set(D.UserId);
            $storage("User").set(D.User);
            if (D.Labels) {
                $storage("Labels").set(D.Labels)
            }
        }
        r = D.ActiveProjectTimestamps;
        d = ProjectsModel.model_data;
        i = values(d);
        for (b = 0, E = i.length; b < E; b++) {
            j = i[b];
            q = TemporaryIds.getRealId(j.id);
            N = r[q];
            if (N === void 0) {
                v = true;
                delete d[q];
                ItemsModel.deleteCacheByProjectId(q, false)
            }
        }
        ProjectsModel.updateTimestamps(r);
        if (v) {
            ProjectsModel.syncCachedData();
            ItemsModel.syncCachedData();
            ItemsModel.cache_all_items = null;
            ItemsModel.cache_project_items = {}
        }
        Signals.sendSignal("sync_state_changed");
        NotificationsModel.updateCount(D.LiveNotificationsUnread);
        l = D.Collaborators;
        if (l && l.length > 0) {
            m = {};
            for (L = 0, C = l.length; L < C; L++) {
                M = l[L];
                m[M.id] = M
            }
            Collaborators.loadData(m)
        }
        if (D.RemindersTimestamp) {
            $storage("RemindersTimestamp").set(D.RemindersTimestamp)
        }
        if (D.Reminders) {
            return RemindersModel.loadData(D.Reminders)
        }
    };
    return a
})();
window.SyncData = new GSyncData();
var GNotesModel, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GNotesModel = (function () {
    function a() {
        this.clearCache = __bind(this.clearCache, this);
        this.loadCachedData = __bind(this.loadCachedData, this);
        this.syncCachedData = __bind(this.syncCachedData, this);
        this.updateNote = __bind(this.updateNote, this);
        this.deleteNote = __bind(this.deleteNote, this);
        this.addNote = __bind(this.addNote, this);
        this.getNotes = __bind(this.getNotes, this);
        this.ajaxGetNotesData = __bind(this.ajaxGetNotesData, this);
        this.syncLocalModel = __bind(this.syncLocalModel, this)
    }
    a.prototype.notes_model = {};
    a.prototype.cache = {};
    a.prototype.syncLocalModel = function (h) {
        var d, b, i, j, c, f, k, g;
        if (keys(h).length === 0) {
            return
        }
        j = this.notes_model;
        update(j, h);
        d = ItemsModel.model_data;
        g = keys(j);
        for (f = 0, k = g.length; f < k; f++) {
            b = g[f];
            i = j[b];
            c = false;
            if (b.indexOf && b.indexOf("_") !== -1) {
                c = true
            }
            if (!d[i.item_id] || i.is_deleted) {
                c = true
            }
            if (c) {
                delete j[b]
            }
        }
        return this.syncCachedData()
    };
    a.prototype.ajaxGetNotesData = function (b, d) {
        var c;
        c = loadJSON("/API/getNotesData");
        c.offline_message = true;
        c.addCallback(d);
        return c.sendReq({
            token: User.token,
            item_id: b
        })
    };
    a.prototype.getNotes = function (b) {
        var g, f, d, c, h;
        b = TemporaryIds.getRealId(b);
        g = this.cache[b];
        if (g) {
            return g
        }
        c = [];
        h = this.notes_model;
        for (d in h) {
            f = h[d];
            if (f.item_id === b) {
                c.push(f)
            }
        }
        c.sort(function (j, i) {
            return j.id - i.id
        });
        this.cache[b] = c;
        return c
    };
    a.prototype.addNote = function (f, h) {
        var d, c, i, g, b, j = this;
        i = window.User.id;
        d = {
            item_id: f,
            content: h,
            posted_uid: i
        };
        g = {};
        g.posted = DateBocks.getNow();
        update(g, d);
        b = g.id = TemporaryIds.generate();
        this.notes_model[g.id] = g;
        TemporaryIds.listen(b, function (l, k) {
            g.id = k;
            return j.clearCache(f)
        });
        c = this.getNotes(f);
        c.push(g);
        this.clearCache(f);
        SyncEngine.queueUpdate({
            type: "note_add",
            temp_id: b,
            args: d
        });
        return g
    };
    a.prototype.deleteNote = function (d, f) {
        var b, c;
        d = TemporaryIds.getRealId(d);
        f = TemporaryIds.getRealId(f);
        SyncEngine.queueUpdate({
            type: "note_delete",
            args: {
                item_id: d,
                note_id: f
            }
        });
        b = this.getNotes(d);
        c = getIndex(f, b, function (g) {
            return g.id === f
        });
        if (c !== -1) {
            b.splice(c, 1)
        }
        if (this.notes_model[f]) {
            delete this.notes_model[f]
        }
        return this.clearCache(d)
    };
    a.prototype.updateNote = function (c, b, d) {
        var f;
        c = TemporaryIds.getRealId(c);
        f = this.notes_model[c];
        if (f) {
            f.content = d
        }
        SyncEngine.queueUpdate({
            type: "note_update",
            args: {
                note_id: c,
                content: d
            }
        });
        return this.clearCache(b)
    };
    a.prototype.syncCachedData = function () {
        $storage("Notes").set(this.notes_model);
        return this.cache = {}
    };
    a.prototype.loadCachedData = function () {
        var b;
        b = $storage("Notes").get();
        if (b) {
            return this.notes_model = b
        } else {
            return this.notes_model = {}
        }
    };
    a.prototype.clearCache = function (b) {
        var c;
        c = ItemsModel.getById(b);
        if (c) {
            ItemsModel.clearCache(c.project_id);
            ItemsModel.syncCachedData()
        }
        return this.syncCachedData()
    };
    return a
})();
window.NotesModel = new GNotesModel();
var GDayOrders;
GDayOrders = (function () {
    function a() {}
    a.prototype.annotate = function (f) {
        var o, l, d, m, j, g, k, i, h, n, c, b;
        l = [];
        d = [];
        for (k = 0, n = f.length; k < n; k++) {
            o = f[k];
            if (o.day_order !== void 0 && o.day_order !== -1) {
                l.push(o)
            } else {
                d.push(o)
            }
        }
        l.sort(function (q, p) {
            return q.day_order - p.day_order
        });
        if (d.length > 0) {
            for (i = 0, c = d.length; i < c; i++) {
                o = d[i];
                j = this.find_position(l, o.project_id, o.priority);
                l.splice(j, 0, o)
            }
            m = {};
            g = 1;
            for (h = 0, b = l.length; h < b; h++) {
                o = l[h];
                m[o.id] = g;
                o.day_order = g;
                g++
            }
            ItemsModel.updateDayOrders(m)
        }
        return l
    };
    a.prototype.find_position = function (o, n, s, f) {
        var q, g, m, p, r, j, i, l, d, c, b, t, u, k;
        if (f == null) {
            f = false
        }
        q = [];
        m = [];
        i = 0;
        for (c = 0, t = o.length; c < t; c++) {
            r = o[c];
            if (r.priority === s) {
                m.push([i, r])
            }
            try {
                j = o[i + 1];
                if (j.priority === s) {
                    i++;
                    continue
                }
            } catch (h) {
                p = h;
                null
            }
            if (m.length > q.length) {
                q = m;
                m = []
            }
            i++
        }
        if (q.length === 0) {
            if (s === 4) {
                return 0
            }
            if (s === 3) {
                d = this.find_position(o, n, 4, f = true);
                if (d !== -1) {
                    return d
                } else {
                    return 0
                }
            }
            if (s === 2) {
                l = this.find_position(o, n, 3, f = true);
                if (l !== -1) {
                    return l
                } else {
                    return 0
                }
            }
            if (s === 1) {
                return o.length
            }
        }
        g = [].concat(q);
        g.reverse();
        for (b = 0, u = g.length; b < u; b++) {
            k = g[b], i = k[0], r = k[1];
            if (r.project_id === n) {
                return i + 1
            }
        }
        if (q.length > 0) {
            return getLast(q)[0] + 1
        }
        if (f) {
            return -1
        } else {
            return o.length
        }
    };
    return a
})();
window.DayOrders = new GDayOrders();
var GQueriesComplex, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GQueriesComplex = (function () {
    function a() {
        this.query = __bind(this.query, this)
    }
    a.prototype.query = function (f, i) {
        var d, h, b, g, c;
        b = [];
        if (f.length === 0 && i.length > 0) {
            b.push({
                type: "label",
                data: this.getByLabels(i)
            })
        } else {
            for (g = 0, c = f.length; g < c; g++) {
                h = f[g];
                d = {};
                if (h.raw) {
                    d.query = d.query_query
                }
                d.type = h.type;
                if (h.type === "overdue") {
                    d.data = ItemsQueries.getOverdue()
                } else {
                    if (h.type === "date") {
                        d.date = h.query_data;
                        d.data = ItemsQueries.getByDate(d.date);
                        d.data = DayOrders.annotate(d.data)
                    } else {
                        if (h.type === "priority") {
                            d.priority = h.query_data;
                            d.data = this.getByPriority(h.query_data)
                        } else {
                            if (h.type === "no date") {
                                d.data = this.getNoDueDate()
                            } else {
                                if (h.type === "viewall") {
                                    d.data = this.getAllByProject()
                                } else {
                                    if (h.type === "labels") {
                                        d.data = LabelsModel.getAll(true)
                                    }
                                }
                            }
                        }
                    }
                } if (i.length > 0) {
                    d.data = this.filterByLabels(d.data, i)
                }
                b.push(d)
            }
        }
        return b
    };
    a.prototype.getByPriority = function (d) {
        var f, b, h, c, g;
        d = 5 - d;
        b = [];
        g = ItemsModel.getAll();
        for (h = 0, c = g.length; h < c; h++) {
            f = g[h];
            if (f.priority === d) {
                b.push(f)
            }
        }
        return b
    };
    a.prototype.getByLabels = function (f, j) {
        var c, l, d, m, h, g, k, b, i;
        if (j == null) {
            j = false
        }
        if (j) {
            m = 0
        } else {
            m = []
        }
        i = ItemsModel.getAll();
        for (h = 0, k = i.length; h < k; h++) {
            l = i[h];
            c = true;
            for (g = 0, b = f.length; g < b; g++) {
                d = f[g];
                if (!isIn(d, TemporaryIds.getRealIds(l.labels))) {
                    c = false;
                    break
                }
            }
            if (c) {
                if (j) {
                    m += 1
                } else {
                    m.push(l)
                }
            }
        }
        return m
    };
    a.prototype.getAllByProject = function () {
        var d, h, b, g, c, f;
        b = [];
        f = ProjectsModel.getAll();
        for (g = 0, c = f.length; g < c; g++) {
            h = f[g];
            d = ItemsModel.getByProjectId(h.id);
            if (d.length > 0) {
                b.push({
                    project_id: h.id,
                    uncompleted: d
                })
            }
        }
        return b
    };
    a.prototype.getNoDueDate = function () {
        var d, b, g, c, f;
        b = [];
        f = ItemsModel.getAll();
        for (g = 0, c = f.length; g < c; g++) {
            d = f[g];
            if (!d.due_date) {
                b.push(d)
            }
        }
        return b
    };
    a.prototype.filterByLabels = function (j, i) {
        var c, l, f, m, d, h, g, k, b;
        m = [];
        for (h = 0, k = j.length; h < k; h++) {
            l = j[h];
            f = l.labels;
            if (f && f.length > 0) {
                c = true;
                for (g = 0, b = i.length; g < b; g++) {
                    d = i[g];
                    if (!isIn(d, f)) {
                        c = false;
                        break
                    }
                }
                if (c) {
                    m.push(l)
                }
            }
        }
        return m
    };
    return a
})();
window.QueriesComplex = new GQueriesComplex();
var GTemporaryIds, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GTemporaryIds = (function () {
    a.prototype.real_id_mapping = {};
    a.prototype.listeners = {};
    a.prototype.listeners_all = [];

    function a() {
        this.waitToResolve = __bind(this.waitToResolve, this);
        this.listenAll = __bind(this.listenAll, this);
        this.listen = __bind(this.listen, this);
        this.setRealIds = __bind(this.setRealIds, this);
        this.getTempId = __bind(this.getTempId, this);
        this.getRealIds = __bind(this.getRealIds, this);
        this.getRealId = __bind(this.getRealId, this);
        this.generate = __bind(this.generate, this);
        this.temp_counter = (new Date()).getTime()
    }
    a.prototype.generate = function () {
        return "_" + this.temp_counter++
    };
    a.prototype.isTemporary = function (b) {
        if (isString(b)) {
            if (b.indexOf("$") === 0) {
                return true
            }
            if (b.indexOf("_") === 0) {
                return true
            }
        }
        return false
    };
    a.prototype.getRealId = function (b) {
        var c;
        c = this.real_id_mapping[b];
        return c && c || b
    };
    a.prototype.getRealIds = function (g) {
        var d, c, f, b;
        d = [];
        for (f = 0, b = g.length; f < b; f++) {
            c = g[f];
            d.push(this.real_id_mapping[c] || c)
        }
        return d
    };
    a.prototype.getTempId = function (b) {
        var d, c, f;
        f = this.real_id_mapping;
        for (d in f) {
            c = f[d];
            if (c === b) {
                return d
            }
        }
        return null
    };
    a.prototype.setRealIds = function (g) {
        var j, h, f, d, i, c, b;
        b = [];
        for (d in g) {
            f = g[d];
            this.real_id_mapping[d] = f;
            h = this.listeners[d];
            if (h) {
                for (i = 0, c = h.length; i < c; i++) {
                    j = h[i];
                    j(d, f)
                }
                delete this.listeners[d]
            }
            if (this.listeners_all.length > 0) {
                b.push((function () {
                    var m, k, n, l;
                    n = this.listeners_all;
                    l = [];
                    for (m = 0, k = n.length; m < k; m++) {
                        j = n[m];
                        l.push(j(d, f))
                    }
                    return l
                }).call(this))
            } else {
                b.push(void 0)
            }
        }
        return b
    };
    a.prototype.listen = function (c, d) {
        var b;
        b = this.real_id_mapping[c];
        if (b) {
            d(c, b);
            return
        }
        if (!this.listeners[c]) {
            return this.listeners[c] = [d]
        } else {
            return this.listeners[c].push(d)
        }
    };
    a.prototype.listenAll = function (b) {
        return this.listeners_all.push(b)
    };
    a.prototype.waitToResolve = function (d, c) {
        var b;
        b = this.getRealId(d);
        if (!this.isTemporary(b)) {
            c(b)
        } else {
            setTimeout($p(this.waitForResolve, d, c), 500)
        }
        return false
    };
    return a
})();
window.TemporaryIds = new GTemporaryIds();
var GUtilModels, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GUtilModels = (function () {
    function a() {
        this.daySort = __bind(this.daySort, this);
        this.sortByDate = $p(this.gSortByGeneric, "time");
        this.sortByPriority = $p(this.gSortByGeneric, "priority")
    }
    a.prototype.getChildren = function (i, k, j) {
        var b, f, c, h, d, g;
        if (j == null) {
            j = false
        }
        b = [];
        if (j) {
            b.push(k)
        }
        f = getIndex(k, i, function (l) {
            return l.id === k.id
        });
        if (f !== -1) {
            h = i.slice(f + 1, +i.length + 1 || 9000000000);
            for (d = 0, g = h.length; d < g; d++) {
                c = h[d];
                if (c.indent <= k.indent) {
                    break
                }
                b.push(c)
            }
        }
        return b
    };
    a.prototype.daySort = function (d, c) {
        if (d.priority > c.priority) {
            return -1
        } else {
            if (d.priority < c.priority) {
                return 1
            } else {
                return this.gSortByGeneric("day_order", d, c)
            }
        }
    };
    a.prototype.sortByItemOrder = function (d, c) {
        if (d.item_order < c.item_order) {
            return -1
        }
        if (d.item_order === c.item_order) {
            return 0
        }
        return 1
    };
    a.prototype.gSortByGeneric = function (h, f, c) {
        var g, d;
        if (!f[h] || !c[h]) {
            return 1
        }
        g = f[h];
        d = c[h];
        if (g > d) {
            return -1
        }
        if (g === d) {
            return 0
        }
        return 1
    };
    return a
})();
window.UtilModels = new GUtilModels();
var GSupportedBrowser;
GSupportedBrowser = (function () {
    function a() {}
    a.prototype.isSupported = function () {
        if (window.localStorage) {
            return true
        } else {
            return false
        }
    };
    a.prototype.showUpgrade = function () {
        var b, c;
        c = function (j, h, g, f, i) {
            var d;
            if (i == null) {
                i = false
            }
            d = "";
            if (i) {
                d = "first"
            }
            return LI(DIV({
                c: d
            }, H4({
                id: j
            }, A({
                href: h
            }, SPAN(g))), H5(f)))
        };
        b = DIV({
            c: "upgade_browser"
        }, H1(_("Please upgrade your browser to use Todoist")), P(_("Todoist is using the latest technology. This makes Todoist faster and enables offline support."), BR(), _("Unfortunately, your browser doesn't support modern technologies.")), P(_("Download one of these great browsers and you can enjoy an user experience that nothing else can match:")), UL({
            c: "downloads"
        }, c("download_chromeframe", "http://www.google.com/chromeframe", "Chrome Frame", "Internet Explorer 6, 7", true), c("download_chrome", "http://www.google.com/chrome/", "Google Chrome", _("Version %s").replace("%s", "5.0+")), c("download_firefox", "http://www.mozilla.com/firefox/", "Mozilla Firefox", _("Version %s").replace("%s", "4.0+")), c("download_ie", "http://www.microsoft.com/windows/internet-explorer/", "Internet Explorer", _("Version %s").replace("%s", "8.0+")), c("download_safari", "http://www.apple.com/safari/", "Apple Safari", _("Version %s").replace("%s", "5.0+"))), P({
            c: "desc"
        }, setHTML(SPAN(), _("Upgraded, but still having problems? Contact <a>Todoist Support</a>").replace("<a>", '<a href="https://todoist.com/Support" target="_blank">'))));
        return RCN($("loading"), b)
    };
    return a
})();
window.SupportedBrowser = new GSupportedBrowser();
var dataLoaded, initTodoist, windowLoaded;
initTodoist = function (b) {
    var a;
    AJS.annotateAjaxData.push(function (c) {
        if (window.CLIENT_ID && c) {
            return c._client_id = window.CLIENT_ID
        }
    });
    if (!SupportedBrowser.isSupported()) {
        return SupportedBrowser.showUpgrade()
    }
    a = [$("top"), $("bottom"), $("content")];
    hideElement(a);
    return LoadEngine.loadData(false, function () {
        showElement(a);
        Loading.hide();
        dataLoaded();
        if (isFunction(b)) {
            return b()
        }
    })
};
dataLoaded = function () {
    var a;
    if (window.User) {
        a = window.IsPremium = User.is_premium
    } else {
        a = window.IsPremium = false
    } if (!a && User.karma > 530) {
        showElement($("premium_promotion"))
    }
    if (window.IS_MINI) {
        MiniTopIcons.render()
    } else {
        TopIcons.render()
    }
    Labels.init();
    initProjectColors();
    if (window.Settings) {
        DateBocks.us_dates = Settings.US_DATES
    } else {
        DateBocks.us_dates = true
    }
    AmiTooltip.init();
    MiniCal.init({
        startDay: window.Settings && Settings.START_DAY || 1
    });
    LocationManager.init();
    window.ProjectList = new GProjectList();
    ProjectEditorGeneric.init();
    window.Agenda = new Agenda();
    if (window.GLabelsExtended) {
        window.LabelsExtended = new GLabelsExtended()
    }
    Agenda.render();
    CompletedHistory.renderCounter();
    CompletedHistory.updateCount(User.completed_count);
    ProjectList.render();
    ProjectsArchive.render();
    ProjectList.current_list = $("project_list");
    ProjectList.insertItems(ProjectsModel.getAll());
    AEV(window, "load", function () {
        ProjectList.arrows.updateArrows();
        return ProjectEditorManager.updateArrows()
    });
    windowLoaded();
    PremiumPromotion.checkEmpty();
    TimezoneChecker.checkTimezone();
    return ViralSpread.countAndShowIfNeeded()
};
windowLoaded = function () {
    var a;
    if (IsPremium) {
        AmiComplete.init()
    }
    Agenda.updateCounters();
    Notifier.init();
    a = getQueryArgument("project_id");
    if (a) {
        ProjectList.setCurrentById(a);
        Loading.hide()
    } else {
        showStartPage()
    }
    return AEV([$("editor")], "contextmenu", function (b) {
        var d, c;
        d = getEventElm(b);
        if (d && ((c = nodeName(d)) === "textarea" || c === "input")) {
            return true
        }
        if (b.ctrl) {
            return false
        }
        return true
    })
};
AEV(window, "scroll", function () {
    if (getScrollTop() > 0) {
        return addClass($("top_right"), "top_right_on")
    } else {
        return removeClass($("top_right"), "top_right_on")
    }
});
if (window.IS_MINI && top.postMessage) {
    setInterval(function () {
        return postMessageToWindow(top, window.location.toString())
    }, 200)
}
var START_PAGE_FIRST_SHOW = true;

function showStartPage(a) {
    if (!isDefined(a)) {
        a = true
    }
    var b = window.Settings && Settings.START_PAGE || "";
    if (window.location.hash && a && START_PAGE_FIRST_SHOW) {
        LocationManager.updateView(window.location.hash);
        START_PAGE_FIRST_SHOW = false;
        Loading.hide();
        return true
    }
    if (ProjectList.isEmpty() && ItemsModel.getAll().length == 0) {
        b = "_blank"
    }
    if (b == "_info_page") {
        window.InfoPage && InfoPage.showIfPossible()
    } else {
        if (b.indexOf("_project_") == 0) {
            var c = parseInt(b.replace("_project_", ""));
            if (ProjectsModel.get(c)) {
                ProjectList.setCurrentById(c)
            }
        } else {
            if (b != "_blank") {
                Agenda.query(Settings.START_PAGE, false)
            } else {
                Agenda.input.value = "";
                RCN($("editor"), null)
            }
        }
    }
    LocationManager.updateLocation("start");
    Signals.sendSignal("hide_all_menus");
    Loading.hide();
    return false
}

function getStartPage() {
    var b = window.Settings && Settings.START_PAGE || "";
    var a;
    if (b == "_info_page") {
        return "info page"
    }
    if (a = b.match(/_project_(\d+)/)) {
        var d = parseInt(a[1]);
        var c = ProjectsModel.get(d);
        if (c) {
            return c.name
        } else {
            return "Project"
        }
    }
    if (b == "_blank") {
        return "blank"
    }
    return b
}

function shortCuts(i) {
    var f = i.keyAscii;
    if (!EDIT_ON) {
        var c = ProjectEditorManager.current_editor;
        if (isIn(f, [97, 65])) {
            if (c) {
                setTimeout(function () {
                    c.addNewItem(f == 65)
                }, 5)
            }
            preventDefault(i);
            return false
        } else {
            if (f == 47) {
                if (window.Mini) {
                    Mini.showController()
                }
                Agenda.input.focus();
                Agenda.input.select();
                preventDefault(i);
                return false
            } else {
                if (f == 115) {
                    ItemsSortBy.sortByDate();
                    preventDefault(i);
                    return false
                } else {
                    if (f == 112) {
                        ItemsSortBy.sortByPriority();
                        preventDefault(i);
                        return false
                    } else {
                        if (i.ctrl && isIn(f, [38, 40])) {
                            if (c) {
                                c.addNewItem(f == 40);
                                preventDefault(i)
                            }
                            return false
                        } else {
                            if (f == 63) {
                                if (GB_CURRENT) {
                                    GB_hide()
                                } else {
                                    return WindowOpener.showKeyboardShortcuts()
                                }
                            } else {
                                if (c && AJS.dnd.current_root && isIn(f, [49, 50, 51, 52, 53])) {
                                    var h = AJS.dnd.current_replacer;
                                    var b = AJS.dnd.current_root;
                                    var g = b.json.indent;
                                    var a = Math.abs(f - 49) + 1;
                                    var d = ProjectList.alterChildIndent(b, a, AJS.dnd.cur_child, true);
                                    GenericManagerUtils.setIndent(h, a);
                                    GenericManagerUtils.setIndent(b, a);
                                    setWidth(b, h.offsetWidth - 10);
                                    preventDefault(i);
                                    map(d, function (j) {
                                        GenericManagerUtils.setIndent(j, j.json.indent)
                                    });
                                    if (DragAndDrop.current_mode == "reordering") {
                                        AJS.dnd.recalculateMarginLeft();
                                        ProjectList.save_indent = true;
                                        c.save_indent = true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function resolveFormatShortcuts(a, d) {
    var g = function (h) {
        if (h == "b" || h == "i") {
            var i = h == "b" && " !! " || "__";
            LibEdit.insertAtCursor(a, i + "~`" + i, true)
        } else {
            LibEdit.insertAtCursor(a, "%(" + h + ") ~`%", true)
        }
        return false
    };
    var f = {
        117: "u",
        98: "b",
        105: "i",
        104: "hl"
    };
    var c = {
        85: "u",
        66: "b",
        73: "i",
        72: "hl",
        89: "hl"
    };
    if (d.ctrl) {
        var b = f[d.keyAscii];
        if (b) {
            preventDefault(d);
            g(b);
            return true
        }
        b = c[d.keyAscii];
        if (b) {
            preventDefault(d);
            g(b);
            return true
        }
    }
    return false
}
IS_FF_MAC = navigator.userAgent.indexOf("Macintosh") != -1 && isMozilla();

function isCtrlEnter(a) {
    return (a.keyAscii == 13 && a.ctrl && !a.shift || IS_FF_MAC && a.keyAscii == 77 & a.ctrl && !a.shift)
}
AEV(document, "keypress", shortCuts);
var CURRENT_ACTION_PERFOMED = null;

function getCurrentActionPerfomed() {
    return CURRENT_ACTION_PERFOMED
}

function actionPerfomed(a) {
    CURRENT_ACTION_PERFOMED = a;
    InfoPage.hide();
    Notifier.hideUnlessSticky();
    AmiTooltip.hide();
    ItemSelecter.deselectAll();
    AmiComplete.hide();
    CURRENT_ACTION_PERFOMED = null
}
var EDIT_ON = false;

function setEditOn() {
    EDIT_ON = true
}

function setEditOff() {
    EDIT_ON = false
}
var INDENT_OFFSETS = {
    1: 0,
    2: 20,
    3: 45,
    4: 70,
    5: 95
};

function updateParent() {
    GB_getLast().addCallback(function () {
        var a = ProjectEditorManager.current_editor;
        if (a) {
            ProjectEditorManager.reRender()
        } else {
            if (Agenda.input.value != "") {
                Agenda.query()
            }
        }
    })
}

function isClickAble(a) {
    return a && !isIn(nodeName(a), ["a", "img"]) && !hasClass(a, "label") && !hasClass(a, "menu")
}

function isHttps() {
    return (window.location.protocol == "https:")
}

function openInPrintMode() {
    var a = window.location.href;
    if (a.indexOf("?") != -1) {
        a = a.replace("?", "?print_mode=1&")
    } else {
        if (a.indexOf("#") != -1) {
            a = a.replace("#", "?print_mode=1#")
        }
    } if (a.indexOf("#") != -1) {
        a = a.split("#")[0] + "#" + LocationManager.cur_location_last
    }
    a = a.replace("mini=1", "minip=0");
    window.open(a);
    return false
}
Signals.connect("comet_td_sync", function (a) {
    if (!SyncEngine.current_req) {
        return SyncEngine.sync(null, true)
    }
});
var GenericManagerUtils = {
    getChildren: function (f, g) {
        var a = g && [f] || [];
        var b = f.json.indent;
        var d = f.nextSibling;
        var c = f.json.project_id;
        while (d) {
            if (hasClass(d, "manager") || hasClass(d, "reorder_item")) {
                d = d.nextSibling;
                continue
            }
            if (!d.json || d.json.indent <= b) {
                break
            }
            if (c != d.json.project_id) {
                break
            }
            a.push(d);
            d = d.nextSibling
        }
        return a
    },
    showChildren: function (c, a) {
        var d = 1;
        var b = true;
        if (a && a.json && a.json.collapsed) {
            b = false
        }
        if (a && a._collapsed != undefined) {
            if (a._collapsed) {
                b = false
            } else {
                b = true
            }
        }
        map(c, function (h) {
            if (!h.json) {
                return
            }
            var g = true;
            var f = h.json.indent;
            if (b && h.json.collapsed) {
                b = false;
                d = f
            } else {
                if (f <= d) {
                    if (h.json.collapsed) {
                        b = false
                    } else {
                        b = true
                    }
                } else {
                    if (!b) {
                        g = false
                    }
                }
            } if (g) {
                showElement(h)
            } else {
                hideElement(h)
            }
        })
    },
    getParent: function (b) {
        var c = b.json.indent;
        var a = b.previousSibling;
        while (a) {
            if (!a.json) {
                a = a.previousSibling
            } else {
                if (a.json.indent < c) {
                    return a
                }
                a = a.previousSibling
            }
        }
        return null
    },
    openParents: function (d) {
        var b = GenericManagerUtils;
        if (!d) {
            return
        }
        var c = b.getParent(d);
        while (c) {
            var a = c.json.collapsed;
            c.json.collapsed = 0;
            if (a) {
                GenericManagerUtils.showChildren(GenericManagerUtils.getChildren(c), c)
            }
            c = b.getParent(c)
        }
    },
    attachMenuIconListeners: function (a) {
        var b = a.menu_icon;
        AEV(a, "mouseover", function () {
            addClass(b, "shown")
        });
        AEV(a, "mouseout", function (c) {
            removeClass(b, "shown")
        })
    },
    imgOnMouseOver: function (a, c, b) {
        AEV(a, "mouseover", function (d) {
            removeClass(a, c);
            addClass(a, b)
        });
        AEV(a, "mouseout", function () {
            removeClass(a, b);
            addClass(a, c)
        })
    },
    getMenuEditIcon: function () {
        var a = DIV({
            "class": "icon menu cmp_menu_off gear_menu"
        });
        a.is_menu_icon = true;
        GenericManagerUtils.imgOnMouseOver(a, "cmp_menu_off", "cmp_menu_on");
        return a
    },
    getIndent: function (c) {
        if (!c) {
            return 1
        }
        var b = 1;
        var a = c.className.match(/indent_(\d)/);
        if (a) {
            return parseInt(a[1])
        }
        return b
    },
    setIndent: function (c, a, b) {
        if (!b) {
            actionPerfomed();
            map([1, 2, 3, 4, 5], function (d) {
                removeClass(c, "indent_" + d)
            })
        }
        addClass(c, "indent_" + a);
        if (c.json) {
            c.indent = a;
            c.json.indent = a
        }
    }
};
var GenericManager = Class({
    init: function (a) {
        this.state_manager = this;
        if (a) {
            update(this, a)
        }
    },
    getAllRenrededItems: function (b) {
        var a = [];
        map(this.current_list.childNodes, function (c) {
            if (c && c.json && !hasClass(c, "reorder_item")) {
                if (b == true) {
                    if (isElementHidden(c)) {
                        return
                    }
                }
                a.push(c)
            }
        });
        return a
    },
    isFormFirst: function () {
        var b = getFirst(this.current_list.childNodes);
        var a = getParentBytc(this.state_manager.current_form, "li");
        return b == a
    },
    isFormLast: function () {
        var a = getLast(this.current_list.childNodes);
        var b = getParentBytc(this.state_manager.current_form, "li");
        return a == b
    },
    getItem: function (a) {
        a = a || getLast;
        var b = a(this.current_list.childNodes);
        if (b && hasClass(b, "reorder_item")) {
            return b.nextSibling
        }
        if (b && b.is_manager) {
            return b.previousSibling
        }
        if (!b || !b.json || b.is_empty) {
            return null
        }
        return b
    },
    addIndentArrows: function (g, f) {
        var b = DIV({
            "class": "cmp_ind_r_off"
        });
        var d = DIV({
            "class": "cmp_ind_l_off"
        });
        var a = this;
        var c = function (j, i) {
            a.incIndent(f, j);
            var h = $bytc("textarea", "text_box", f)[0];
            h.focus();
            preventDefault(i);
            return false
        };
        GenericManagerUtils.imgOnMouseOver(d, "cmp_ind_l_off", "cmp_ind_l_on");
        GenericManagerUtils.imgOnMouseOver(b, "cmp_ind_r_off", "cmp_ind_r_on");
        b.onclick = $p(c, 1);
        d.onclick = $p(c, -1);
        ACN(g, b, d)
    },
    generateAddEditForm: function (w) {
        var t = LI({
            "class": "manager indent_1"
        });
        t.is_manager = true;
        var f = FORM();
        if (w.submit_icon) {
            w.submit_icon = imageSprite(w.submit_icon, 16, 16)
        }
        var l = AmiButton.createButton(w.submit_val);
        addClass(l, "amibutton_red");
        addClass(l, "submit_btn");
        f.onsubmit = function () {
            return false
        };
        ACN(t, f);
        var p = {
            name: "ta",
            "class": "text_box",
            tabIndex: 1,
            autocomplete: "off"
        };
        var k;
        if (AJS.isSafari()) {
            k = TEXTAREA(p, w.name_val)
        } else {
            k = TEXTAREA(p);
            k.value = w.name_val
        }
        k.onfocus = setEditOn;
        k.onblur = setEditOff;
        if (this.TA_CONTROLLER) {
            this.TA_CONTROLLER.remove()
        }
        var j = this.TA_CONTROLLER = new ResizingTextArea(this, k);
        var i = $p(w.action, f);
        f.submit_fn = i;
        l.onclick = function (d) {
            i(d);
            return false
        };
        var o = this;
        var v = function (y) {
            y = y || window.event;
            setEventKey(y);
            if (y.keyAscii == 27) {
                if (window.AmiComplete && window.AmiComplete.shown()) {
                    return false
                }
                k.blur();
                setEditOff();
                if (w.cancel) {
                    w.cancel.onclick()
                }
            }
            var d = resolveFormatShortcuts(k, y);
            if (d) {
                return false
            }
            if (y.ctrl && y.keyAscii == 77) {
                return true
            }
            if (w.onKeyPress) {
                return w.onKeyPress(y, t)
            }
            if (isCtrlEnter(y)) {
                preventDefault(y);
                f.submit_fn(function (D) {
                    k.blur();
                    o.showAddItem(true, true)
                }, true);
                return false
            }
            if (y.keyAscii == 13 && y.shift) {
                preventDefault(y);
                f.submit_fn(function (D) {
                    k.blur();
                    o.showAddItem(true, false)
                }, true);
                return false
            } else {
                if (y.keyAscii == 13) {
                    if (window.AmiComplete && window.AmiComplete.shown()) {
                        return false
                    }
                    preventDefault(y);
                    k.blur();
                    f.submit_fn(null, true);
                    return false
                } else {
                    if (y.keyAscii == 9 && !y.ctrl) {
                        var x = $f(f, "due_date");
                        if (x && !AmiComplete.shown()) {
                            var C = getEventElm(y);
                            if (C && !hasClass(C, "due_date")) {
                                preventDefault(y);
                                x.select();
                                return false
                            }
                        }
                    }
                }
            } if (y.ctrl && y.keyAscii == 37 && !y.shift) {
                preventDefault(y);
                o.incIndent(t, -1);
                return false
            }
            if (y.ctrl && y.keyAscii == 39 && !y.shift) {
                preventDefault(y);
                o.incIndent(t, 1);
                return false
            }
            var z = function (D) {
                if (o.current_mode == "edit") {
                    o.saveItem(o.state_manager.current_form, D, true)
                } else {
                    o.addItem(o.state_manager.current_form, D, true)
                }
            };
            if (y.ctrl && y.keyAscii == 38 && !y.shift) {
                z(o.editPrevItem);
                return false
            }
            if (y.ctrl && y.keyAscii == 40 && !y.shift) {
                z(o.editNextItem);
                return false
            }
        };
        var h = [k];
        h = h.concat($bytc("input", null, f));
        if (w.inputs) {
            h = h.concat(w.inputs)
        }
        map(h, function (d) {
            attachKeyDown(d, v)
        });
        var s = TABLE({
            width: "100%"
        });
        var a = TBODY();
        ACN(s, a);
        var g;
        var u;
        var r = TABLE(TBODY(g = TR(u = TD({
            c: "text_box_holder"
        }, k))));
        AEV(u, "click", function () {
            k.focus()
        });
        var c = TD({
            colSpan: 2,
            "class": "form_content"
        }, r);
        var b = TR(c);
        ACN(a, b);
        if (w.indent_arrows) {
            var m = TD({
                rowSpan: 2,
                "class": "indent_arrows"
            });
            ACN(b, m);
            this.addIndentArrows(m, t)
        }
        var n = TD({
            align: "left"
        });
        var q = TD({
            align: "right"
        });
        ACN(n, l, w.cancel);
        if (w.td_extra) {
            ACN(q, w.td_extra)
        }
        ACN(a, TR(n, q));
        ACN(f, s);
        return {
            li_item: t,
            form: f,
            textarea_controller: j,
            textarea: k,
            text_box_holder: u,
            duedate: $f(f, "due_date"),
            form_content: c,
            input_holders_tr: g
        }
    },
    insertForm: function (b, c) {
        var a = this.current_item;
        if (a && c == true) {
            insertBefore(b, a)
        } else {
            if (this.current_item) {
                var d = a.nextSibling;
                while (d && isElementHidden(d)) {
                    d = d.nextSibling
                }
                if (d) {
                    insertAfter(b, d.previousSibling || a)
                } else {
                    ACN(this.current_list, b)
                }
            } else {
                ACN(this.current_list, b)
            }
        }
        FocusElm.focus(b, null, 35)
    },
    saveCurrentItem: function (b) {
        var a = this.state_manager.current_form;
        if (a) {
            if ($f(a, "ta").value == "") {
                this.cancelCurrentEdit(true);
                b()
            } else {
                if (this.current_mode == "add") {
                    this.addItem(a, b)
                } else {
                    this.saveItem(a, b)
                }
            }
        } else {
            b()
        }
    },
    editPrevItem: function () {
        actionPerfomed();
        var a = this.current_item.previousSibling;
        while (a && isElementHidden(a)) {
            a = a.previousSibling
        }
        if (a) {
            this.current_item = a;
            this.editCurrentItem(true)
        } else {
            try {
                if (!this.isFormFirst()) {
                    this.showAddItem(true, true)
                }
            } catch (b) {
                this.showAddItem(true, true)
            }
        }
    },
    editNextItem: function () {
        actionPerfomed();
        var a = this.current_item.nextSibling;
        while (a && isElementHidden(a)) {
            a = a.nextSibling
        }
        if (a) {
            this.current_item = a;
            this.editCurrentItem(true)
        } else {
            try {
                if (!this.isFormLast()) {
                    this.showAddItem(true, false)
                }
            } catch (b) {
                this.showAddItem(true, false)
            }
        }
    },
    showAddItem: function (b, c, a) {
        setEditOn();
        actionPerfomed();
        this.setCurrentItem();
        this.current_mode = "add";
        this.removeEmpty();
        this.cancelCurrentEdit()
    },
    editCurrentItem: function () {
        setEditOn();
        this.setCurrentItem();
        this.current_mode = "edit";
        actionPerfomed();
        this.cancelCurrentEdit();
        hideElement(this.current_item)
    },
    incIndent: function (c, a) {
        var b = GenericManagerUtils.getIndent(c) + a;
        if (b < 1) {
            b = 1
        }
        if (b > this.max_indent) {
            b = this.max_indent
        }
        var d = this.current_item;
        GenericManagerUtils.setIndent(c, b);
        if (this.TA_CONTROLLER) {
            this.TA_CONTROLLER.current_indent = parseInt(b);
            this.TA_CONTROLLER.resize()
        }
    },
    alterChildIndent: function (h, a, d, f) {
        var b = this;
        var c = h.json.indent != a;
        if (c && ((h.json.collapsed == 1) || f)) {
            d = d || GenericManagerUtils.getChildren(h);
            var g = a - h.json.indent;
            map(d, function (k) {
                var i = k.json.indent + g;
                if (i > 4) {
                    i = 4
                }
                k.json.indent = i;
                var j = k.json.id;
                b.data_model.update(j, {
                    indent: i
                })
            });
            return d
        }
        return []
    },
    empty_text: "No items",
    isEmpty: function () {
        return this.getAllRenrededItems().length == 0
    },
    renderEmpty: function () {
        return LI({
            "class": "empty"
        }, this.empty_text)
    },
    checkEmpty: function () {
        if (this.isEmpty()) {
            removeElement($bytc("li", "empty", this.current_list));
            var a = this.renderEmpty();
            if (a) {
                ItemForms.doubleClick(a, this.showAddItem);
                a.is_empty = true;
                ACN(this.current_list, a)
            }
            return true
        } else {
            this.removeEmpty()
        }
        return false
    },
    removeEmpty: function () {
        removeElement($bytc("li", "empty", this.current_list))
    },
    saveOrder: function (f) {
        var b = this;
        var a = $bytc("li", null, this.current_list);
        var c = 0;
        var d = {};
        map(a, function (h) {
            if (h.json) {
                c++;
                var g = h.json.indent;
                var i = c;
                h.json.item_order = c;
                d[h.json.id] = [i, g]
            }
        });
        this.data_model.updateOrdersIndents(d);
        if (isFunction(f)) {
            f(a)
        }
        return false
    },
    incNextSiblings: function (d, f) {
        var c = d.json.item_order;
        var b = d.nextSibling;
        var a = {};
        while (b) {
            if (b.json) {
                c++;
                a[b.json.id] = [c, b.json.indent]
            }
            b = b.nextSibling
        }
        this.data_model.updateOrdersIndents(a)
    },
    setCurrentItem: function () {
        var a = this.menu;
        if (a.current_holder) {
            this.current_item = a.current_holder;
            a.current_holder = null;
            this.menu.hide(null, true)
        }
    },
    withCurrentItem: function (a) {
        return genericWithCurrentItem(this, this.menu, a)
    },
    cancelCurrentEdit: function () {
        var a = this.state_manager.current_cancel;
        if (a) {
            a.onclick();
            setEditOff();
            this.state_manager.current_cancel = null
        }
    }
});
GenericArrows = new AJS.Class({
    init: function (a) {
        if (a) {
            update(this, a)
        }
        if (this.x_off != undefined) {
            this.x_off = this.x_off
        } else {
            this.x_off = 0
        }
        bindMethods(this)
    },
    updateArrows: function (a) {
        a = a || this.list.current_list;
        if (a) {
            this.removeArrows(a);
            this._updateArrows(a);
            if (this.list.current_his_list) {
                this._updateArrows(this.list.current_his_list)
            }
        }
    },
    hideArrows: function () {
        if (!this.list.current_list) {
            return
        }
        var a = this._getArrows(this.list.current_list);
        map(a, function (b) {
            hideElement(b)
        })
    },
    showArrows: function () {
        if (!this.list.current_list) {
            return
        }
        var a = this._getArrows(this.list.current_list);
        map(a, function (b) {
            showElement(b)
        })
    },
    displayArrow: function (d, b) {
        if (d.is_manager) {
            return
        }
        if (d.json && d.json.dont_show_arrow) {
            return
        }
        var g = d.json && d.json.collapsed;
        if (b == true) {
            g = true
        }
        if (d._collapsed != undefined) {
            if (d._collapsed) {
                g = true
            } else {
                g = false
            }
        }
        var c = this._hasChildren(d);
        if (window.IS_MINI) {
            if (c && d.json && d.json.indent == 1) {
                addClass(d, "arrow_indent")
            } else {
                removeClass(d, "arrow_indent")
            }
        }
        if (c) {
            var a = "cmp_arrow_open";
            if (g) {
                a = "cmp_arrow_closed"
            }
            var f = imageSprite(a, 18, 18);
            addClass(f, "arrow");
            appendToTop(d, f);
            f.host_item = d;
            d.arrow = f;
            f.onclick = $p(this._switchState, f);
            return f
        }
    },
    removeArrows: function (b) {
        var a = this._getArrows(b);
        map(a, function (c) {
            if (c.host_item) {
                c.host_item.arrow = null
            }
            removeElement(c)
        })
    },
    setList: function (a) {
        this.list = a
    },
    _updateArrows: function (c) {
        var b = getFirst(c.childNodes);
        var a = b;
        while (a) {
            if (!isElementHidden(a) && !this._childEdited(a)) {
                this.displayArrow(a)
            }
            a = a.nextSibling
        }
    },
    _saveState: function (a, b) {
        this.data_model.update(a, {
            collapsed: b
        }, true)
    },
    _switchState: function (c, b) {
        if (!c) {
            return
        }
        var a = c.host_item;
        var d;
        if (a.json.collapsed) {
            a.json.collapsed = 0;
            GenericManagerUtils.showChildren(GenericManagerUtils.getChildren(a), a)
        } else {
            a.json.collapsed = 1;
            map(GenericManagerUtils.getChildren(a), function (f) {
                hideElement(f)
            })
        }
        this.updateArrows(getParentBytc(a, "ul"));
        this._saveState(a.json.id, a.json.collapsed)
    },
    _hasEdit: function (a, b) {
        if (a.is_manager && GenericManagerUtils.getIndent(a) <= b) {
            return true
        }
        return true
    },
    _childEdited: function (a) {
        var c = a.nextSibling;
        if (!c) {
            return false
        }
        var d;
        if (!a.json) {
            if (!a.previousSibling || !a.previousSibling.json) {
                return false
            }
            d = a.previousSibling.json.indent
        } else {
            d = a.json.indent
        }
        while (c) {
            var b = c.json;
            if (b && b.indent <= d) {
                return false
            }
            if (c.is_manager) {
                return true
            }
            if (b && b.indent <= d) {
                return false
            }
            c = c.nextSibling
        }
        return false
    },
    _getArrows: function (b) {
        if (b) {
            var a = getParentBytc(b, "div");
            return $bytc("img", "arrow", a)
        } else {
            if (!this.list_holder) {
                this.list_holder = getParentBytc(this.list.current_list, "td")
            }
            return $bytc("img", "arrow", this.list_holder)
        }
    },
    _hasChildren: function (b) {
        if (!b || !b.json) {
            return false
        }
        var a = b.nextSibling;
        if (a && a.json && a.json.indent > b.json.indent) {
            return true
        }
        return false
    }
});
if (AJS.isMozilla()) {
    GenericArrows.y_offset = 4
}
var MenuRightClick, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
MenuRightClick = (function () {
    function a(b, c) {
        var d = this;
        this.li = b;
        this.menu = c;
        this.rightClick = __bind(this.rightClick, this);
        AEV(b, "contextmenu", function (f) {
            return d.rightClick(f)
        });
        addClass(b, "menu_clickable")
    }
    a.prototype.rightClick = function (b) {
        if (window.event) {
            window.event.returnValue = false
        }
        preventDefault(b);
        try {
            return this.menu(b)
        } finally {
            return false
        }
    };
    return a
})();
var GSyncStateIcon, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GSyncStateIcon = (function () {
    function a() {
        this.showOfflineInfo = __bind(this.showOfflineInfo, this);
        this._syncStateChanged = __bind(this._syncStateChanged, this);
        this.syncStateChanged = __bind(this.syncStateChanged, this);
        this.render = __bind(this.render, this);
        var b = this;
        this.cur_state = null;
        Signals.connect("sync_state_changed", this.syncStateChanged);
        AEV(window, "online", this.syncStateChanged);
        AEV(window, "offline", this.syncStateChanged);
        AEV(window, "load", function () {
            b.render();
            if (navigator.onLine === false) {
                return b.syncStateChanged()
            }
        })
    }
    a.prototype.render = function () {
        if (this.holder) {
            return this.holder
        }
        this.holder = SPAN({
            id: "sync_state_icon"
        });
        return this.holder
    };
    a.prototype.syncStateChanged = function () {
        if (!this.holder) {
            return
        }
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        return this.timeout = setTimeout(this._syncStateChanged, 100)
    };
    a.prototype._syncStateChanged = function () {
        var f, b, d, h, c, g = this;
        h = SyncEngine.getSyncState();
        c = SyncEngine.sync_states;
        f = null;
        if (h === c.syncing) {
            f = "syncing"
        } else {
            if (h === c.needs_sync) {
                f = "offline"
            } else {
                if (!LoadEngine.fetched_data_from_server) {
                    f = "offline"
                } else {
                    f = "none"
                }
            }
        } if (this.cur_state === f) {
            return
        }
        this.cur_state = f;
        b = navigator.onLine;
        if (b !== void 0) {
            if (!b) {
                f = "offline"
            }
        }
        if (f) {
            RCN(this.holder, null);
            if (f === "syncing") {
                return ACN(this.holder, Indicator.indicatorImg())
            } else {
                if (f === "offline") {
                    d = A({
                        href: "#"
                    }, imageSprite("cmp_needs_sync", 16, 16));
                    AEV(d, "mouseover", $p(this.showOfflineInfo, d));
                    AEV(d, "mouseout", AmiTooltip.hide);
                    AEV(d, "click", function () {
                        AmiTooltip.hide();
                        g.cur_state = "syncing";
                        SyncEngine.sync(null, true);
                        RCN(g.holder, Indicator.indicatorImg());
                        return false
                    });
                    return ACN(this.holder, d)
                }
            }
        }
    };
    a.prototype.showOfflineInfo = function (f, d) {
        var b, g, c, h;
        h = SyncEngine.getSyncState();
        if (h === SyncEngine.sync_states.needs_sync) {
            g = SyncEngine.timeout / 1000;
            c = _("%s seconds").replace("%s", g || 10);
            b = DIV(_("Needs to sync with Todoist"), BR(), _("Will try to sync again in %s").replace("%s", c), BR(), _("Click on this icon to force a sync"))
        } else {
            b = _("No need to sync")
        }
        return AmiTooltip.show(f, DIV({
            c: "tooltip_cnt"
        }, B(_("Offline mode is on")), BR(), b))
    };
    return a
})();
window.SyncStateIcon = new GSyncStateIcon();
var RE_BULLET, genericWithCurrentItem, handleTextShortcuts, isBulletItem;
RE_BULLET = new RegExp("^s*\\*");
isBulletItem = function (a) {
    var b;
    if (a && a.json) {
        b = a.json.content
    } else {
        b = a
    }
    return RE_BULLET.test(b)
};
handleTextShortcuts = function (c) {
    var d, a, b;
    b = /[ ]*![pP]([1234])|!!([1234])/;
    a = c.content.match(b);
    if (a) {
        d = a[1] || a[2];
        c.priority = Math.abs(parseInt(d) - 5);
        c.content = c.content.replace(b, "")
    }
    return c
};
genericWithCurrentItem = function (a, c, d) {
    var b;
    b = a.current_item;
    if (!c.current_holder) {
        return d(b)
    } else {
        a.current_item = c.current_holder;
        c.current_holder = null;
        d(a.current_item);
        c.hide(null, true);
        if (b) {
            return a.current_item = b
        }
    }
};
var GItemCheckbox, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GItemCheckbox = (function () {
    function a() {
        this.update = __bind(this.update, this);
        this.create = __bind(this.create, this)
    }
    a.prototype.create = function (b, d, f) {
        var c, g = this;
        if (f === void 0) {
            f = b.json.checked
        }
        c = AmiCheckbox.genereate();
        AEV(c, "click", function (h) {
            if (c.disabled || h.ctrl || DragAndDrop.mode === "reordering") {
                return false
            } else {
                AmiCheckbox.setIndicator(c);
                return d(b, h)
            }
        });
        if (!isBulletItem(b.json)) {
            AmiCheckbox.setChecked(c, f)
        }
        return c
    };
    a.prototype.update = function (h, g, d, f) {
        var c, b;
        if (f == null) {
            f = true
        }
        if (!h) {
            return
        }
        if (g) {
            if (f) {
                h.json.checked = 1
            }
            addClass(h, "checked")
        } else {
            if (f) {
                h.json.checked = 0
            }
            removeClass(h, "checked")
        }
        c = $bytc("div", "amicheckbox", h)[0];
        b = this.create(h, d, g);
        swapDOM(c, b);
        return b
    };
    return a
})();
window.ItemCheckbox = new GItemCheckbox();
var GItemsRender, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GItemsRender = (function () {
    function a() {
        this.createProjectItem = __bind(this.createProjectItem, this);
        this.setPriority = __bind(this.setPriority, this);
        this.getMenuEditIcon = __bind(this.getMenuEditIcon, this);
        this.renderItem = __bind(this.renderItem, this)
    }
    a.prototype.temporary_projects = {};
    a.prototype.renderItem = function (u, k) {
        var c, h, s, o, f, t, r, n, j, d, b, m, g, q, i, p, l;
        if (u.due_date && isString(u.due_date)) {
            ItemsModel.convertToDateObject(u)
        }
        j = LI({
            c: "task_item item_" + u.id,
            id: "item_" + u.id
        });
        j.json = u;
        if (u.checked) {
            addClass(j, "checked")
        }
        ACN(j, n = TABLE({
            cellpadding: 0,
            cellspacing: 0
        }, b = TBODY()));
        j.td_checker = m = TD({
            c: "checker"
        });
        if (!isBulletItem(u.content) && k.no_checkbox !== true) {
            if (u.is_archived) {
                h = function () {
                    alert(_("This project is archived. Unarchive it to be able to edit it."));
                    ItemCheckbox.update(j, u.checked, h);
                    return true
                }
            } else {
                if (u.checked) {
                    h = k.fn_undo_complete_item
                } else {
                    h = k.fn_complete_item
                }
            }
            ACN(m, c = ItemCheckbox.create(j, h))
        }
        q = null;
        if (k.with_time) {
            p = "35px";
            if (window.Settings.AMPM) {
                p = "45px"
            }
            if (DateController.hasTime(u.date_string)) {
                f = DIV({
                    "class": "div_time"
                }, SPAN(DateController.getHourAndMin(u.due_date, Settings.AMPM)));
                f.style.minWidth = p;
                if (DateController.isOverdue(DateBocks.getNow(), u.due_date)) {
                    addClass(f, "time_overdue")
                }
                q = TD({
                    "class": "time"
                }, f)
            }
        }
        g = null;
        if (k.with_project) {
            j.td_project = g = TD({
                "class": "project"
            }, this.createProjectItem(u));
            ItemDueDates.updateAlarmIcon(g, u.has_notifications);
            if (RecurringDates.isEveryDate(u.date_string)) {
                ATT(g, imageSprite("cmp_recurring", 12, 11))
            }
        }
        ATT(j, DIV({
            c: "invisible_space"
        }));
        o = null;
        if (k.with_due_date) {
            o = DIV({
                c: "text_cursor div_due_date"
            }, t = ItemDueDates.create(u))
        }
        l = Formatter.format(u.content);
        i = AJS.setHTML(SPAN({
            c: "text"
        }), l);
        Notes.annotate(u, i, j);
        ACN(i, setHTML(DIV(), Labels.format("", u)));
        j.content = s = TD({
            c: "text_cursor content"
        }, o, i);
        j.td_menu = d = null;
        r = true;
        if (u.is_archived || k.not_editable) {
            r = false
        }
        if (r) {
            j.td_menu = d = TD({
                c: "menu"
            }, this.getMenuEditIcon(j, k.fn_toggle_menu));
            new MenuRightClick(j, $p(k.fn_toggle_menu, j, {
                id: u.id
            }, u.id));
            ItemSelecter.selectClick(j);
            if (!k.no_drag_and_drop) {
                DragAndDrop.attach(j)
            }
        }
        if (!k.no_indent) {
            GenericManagerUtils.setIndent(j, u.indent, true)
        }
        addClass(j, "priority_" + u.priority);
        if (q) {
            ACN(b, TR(m, q, s, g, d))
        } else {
            ACN(b, TR(m, s, g, d))
        }
        j.render_opts = k;
        return j
    };
    a.prototype.getMenuEditIcon = function (b, c) {
        var d;
        d = GenericManagerUtils.getMenuEditIcon();
        AEV(d, "click", $p(c, b, d, b.json.id));
        b.menu_icon = d;
        GenericManagerUtils.attachMenuIconListeners(b);
        return d
    };
    a.prototype.setPriority = function (g) {
        var c, f, b, d;
        if (!g) {
            return false
        }
        d = [1, 2, 3, 4];
        for (f = 0, b = d.length; f < b; f++) {
            c = d[f];
            removeClass(g, "priority_" + c)
        }
        return addClass(g, "priority_" + g.json.priority)
    };
    a.prototype.createProjectItem = function (g) {
        var f, d, h, c, b;
        h = ProjectsModel.get(g.project_id);
        if (!h) {
            h = this.temporary_projects[g.project_id]
        }
        if (!h) {
            h = {
                name: _("Undefined"),
                id: null,
                color: null
            }
        }
        f = h.name;
        f = f.replace(/^-\s*/, "");
        f = trimIfNeeded(f, 30);
        c = SPAN({
            c: "agenda_pcolor"
        }, "");
        b = setHTML(SPAN({
            c: "clickable project_item"
        }), Formatter.format(f));
        ACN(b, c);
        d = h.color || 0;
        if (h.inbox_project) {
            d = 7
        }
        c.style.backgroundColor = ProjectColors[d] || "#dddddd";
        c.style.color = ProjectColors[d] || "#dddddd";
        AEV(b, "click", function (i) {
            if (i.ctrl || i.shift) {
                return false
            }
            if (h.id) {
                ProjectList.setCurrentById(h.id, g.id)
            }
            return false
        });
        return b
    };
    return a
})();
window.ItemsRender = new GItemsRender();
var GItemCommonEdits, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GItemCommonEdits = (function () {
    function a() {
        this._undoDelete = __bind(this._undoDelete, this);
        this.notifyDeletedItems = __bind(this.notifyDeletedItems, this);
        this.undo_items = []
    }
    a.prototype.updatePriority = function (f, c) {
        var d, b, g;
        actionPerfomed();
        resetPriorities();
        if (f.json) {
            g = ItemsModel.update(f.json.id, {
                priority: c
            }), f = g[0], b = g[1];
            d = $("item_" + f.id);
            if (d) {
                update(d.json, f);
                ItemsRender.setPriority(d)
            }
            return Agenda.updateCounters()
        }
    };
    a.prototype.deleteCurrentItem = function (b) {
        actionPerfomed();
        return b.withCurrentItem(function (i) {
            var g, h, d, f, c;
            if (b === Agenda) {
                g = $gc(i, "img", "arrow");
                if (g) {
                    Agenda._fetchChildren(g)
                }
            }
            d = GenericManagerUtils.getChildren(i, true);
            for (f = 0, c = d.length; f < c; f++) {
                h = d[f];
                addClass(h, "selected")
            }
            return ItemSelecter.deleteItems(d)
        })
    };
    a.prototype.notifyDeletedItems = function (g) {
        var f, d, b, c, h = this;
        this.undo_items = g;
        b = g.length;
        c = A({
            href: "#"
        }, _("Undo"));
        AEV(c, "click", function () {
            h._undoDelete();
            Notifier.hide();
            return false
        });
        d = A({
            href: "#",
            c: "hide_link"
        }, _("Hide"));
        AEV(d, "click", Notifier.hide);
        f = _("%s tasks deleted").replace("%s", Math.abs(b));
        return Notifier.show(SPAN(f, c, d), false)
    };
    a.prototype._undoDelete = function () {
        var i, j, d, h, l, c, b, f, k, g;
        if (this.undo_items.length === 0) {
            return
        }
        h = 0;
        d = this.undo_items[0].indent;
        if (d > 1) {
            h = d - 1
        }
        i = ProjectEditorManager.current_editor;
        if (i) {
            j = "project_editor"
        } else {
            j = "agenda"
        }
        b = {};
        g = this.undo_items;
        for (f = 0, k = g.length; f < k; f++) {
            l = g[f];
            delete l.item_order;
            l.indent -= h;
            c = ItemsModel.add(l);
            if (j === "project_editor") {
                b[l.project_id] = l.project_id
            }
        }
        if (j === "project_editor") {
            Signals.sendSignal("projects.rerender", values(b))
        }
        if (j === "agenda") {
            Agenda.query(Agenda.input.value)
        }
        if (j === "project_editor" && this.undo_items.length > 0) {
            ProjectEditorManager.removeEmpty()
        }
        this.undo_items = [];
        return Agenda.updateCounters()
    };
    return a
})();
window.ItemCommonEdits = new GItemCommonEdits();
var GItemEdit, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GItemEdit = (function () {
    a.prototype.current_priority = 4;

    function a() {
        this.menuPriorityUpdated = __bind(this.menuPriorityUpdated, this);
        this.annotatePrioirtyButton = __bind(this.annotatePrioirtyButton, this);
        this.annotateReminderButton = __bind(this.annotateReminderButton, this);
        this.genericSaveItem = __bind(this.genericSaveItem, this);
        this.genericAddItem = __bind(this.genericAddItem, this);
        this.genericCancelEdit = __bind(this.genericCancelEdit, this);
        this.onShowContent = __bind(this.onShowContent, this);
        this.onSaveContent = __bind(this.onSaveContent, this);
        this.generateForm = __bind(this.generateForm, this);
        Signals.connect("menu_priority_changed", this.menuPriorityUpdated)
    }
    a.prototype.generateForm = function (g, b) {
        var j, i, f, c, m, n, l, d, h, k;
        if (g.name_val) {
            ContentTransformers.setupByContent(g.name_val);
            if (ContentTransformers.type) {
                g.name_val = ContentTransformers.onContentShow(g.name_val)
            }
        }
        c = ItemForms.createDueInput(g);
        AEV(c, "focus", setEditOn);
        AEV(c, "blur", setEditOff);
        if (g.due_date) {
            g.date_string = DateUtils.normalizeDate(g.date_string);
            if (RecurringDates.isEveryDate(g.date_string)) {
                c.value = RecurringDates.format(g.date_string)
            } else {
                c.value = DateController.formatDate(g.due_date, false, true, true);
                if (DateController.hasTime(g.date_string)) {
                    c.value += " @ ";
                    c.value += DateController.getHourAndMin(g.due_date, Settings.AMPM)
                }
            } if (window.I18N_LANG) {
                c.value = translate_to_lang(I18N_LANG, LANG, c.value)
            }
        }
        g.inputs = [c];
        g.td_extra = SPAN(m = SPAN(), d = SPAN(), l = SPAN());
        j = ProjectEditorManager.current_editor;
        if (!j) {
            j = ProjectEditorManager.createEditorInstance()
        }
        i = j.generateAddEditForm(g);
        if (ContentTransformers.type && !hasClass(i.text_box_holder, "has_content_icon")) {
            ContentTransformers.annotateWithIcon(i.textarea)
        }
        ACN(i.input_holders_tr, k = TD({
            c: "due_date_holder"
        }, c));
        AEV(k, "click", function (o) {
            var p;
            p = getEventElm(o);
            if (nodeName(p) !== "a") {
                return c.focus()
            }
        });
        i.duedate = c;
        if (g.no_indent) {
            i.form.no_indent = true
        }
        h = i.textarea;
        if (g.current_item) {
            h.value = Labels.textFormat(g.name_val, g.current_item.json.labels);
            f = GenericManagerUtils.getIndent(g.current_item);
            GenericManagerUtils.setIndent(i.li_item, f)
        }
        if (window.IsPremium) {
            LabelsExtended.annotateFormArea(h, m)
        }
        BufferedRemindersModel.reset();
        d = this.annotateReminderButton(d, g);
        n = 4;
        if (g.priority) {
            n = 5 - g.priority
        }
        this.current_priority = n;
        l = this.annotatePrioirtyButton(l, n);
        if (b && b.fixed_pos) {
            addClass([h, c, l, d, m], "fixed_pos")
        }
        i.form.old_date = i.duedate.value;
        return i
    };
    a.prototype.onSaveContent = function (b) {
        if (ContentTransformers.type) {
            return ContentTransformers.onContentSave(b)
        } else {
            return b
        }
    };
    a.prototype.onShowContent = function (b) {
        if (ContentTransformers.type) {
            return ContentTransformers.onContentShow(b)
        } else {
            return b
        }
    };
    a.prototype.genericCancelEdit = function () {
        return ContentTransformers.onContollerHide()
    };
    a.prototype.genericAddItem = function (c, d) {
        var b;
        b = ContentTransformers;
        if (b.type) {
            d.content = b.onContentSave(d.content);
            return b.onContollerHide()
        }
    };
    a.prototype.genericSaveItem = function (k, b, p) {
        var h, i, c, n, m, g, d, o, f, l, j;
        m = getParentBytc(b, "li");
        i = $f(b, "due_date");
        c = i.value;
        h = ItemForms.parseDueDate(i);
        if (h === false) {
            return false
        }
        o = 5 - this.current_priority;
        f = {
            id: k.json.id,
            content: this.onSaveContent($f(b, "ta").value),
            priority: o
        };
        if (b.no_indent !== true) {
            g = GenericManagerUtils.getIndent(m);
            f.indent = g;
            n = ProjectEditorManager.current_editor;
            if (!n) {
                n = ProjectEditorManager.createEditorInstance()
            }
            n.alterChildIndent(k, g)
        }
        if (b.old_date !== c) {
            f.due_date = h[0];
            f.date_string = DateUtils.normalizeDate(i.value)
        }
        handleTextShortcuts(f);
        removeElement(m);
        j = ItemsModel.update(k.json.id, f), d = j[0], l = j[1];
        this.current_priority = 4;
        this.priority_button = null;
        if (ContentTransformers.type) {
            ContentTransformers.onContollerHide()
        }
        return {
            item: d,
            is_updated: l
        }
    };
    a.prototype.annotateReminderButton = function (f, g) {
        var c, d, b, h = this;
        d = g.current_item;
        if (d && d.json.has_notifications) {
            b = "cmp_reminders_on"
        } else {
            b = "cmp_reminders"
        }
        c = imageSprite(b, 22, 16);
        c.id = "reminders_icon";
        addClass(c, "form_action_icon menu_icon");
        AEV(c, "click", function (i) {
            Reminders.showTooltip(d, c, i);
            return false
        });
        swapDOM(f, c);
        AmiTooltip.showSimpleText(c, _("Reminders"));
        return c
    };
    a.prototype.annotatePrioirtyButton = function (b, d) {
        var c, f = this;
        if (d == null) {
            d = 4
        }
        c = imageSprite("cmp_priority" + d, 22, 16);
        AEV(c, "click", function (g) {
            PriorityMenu.show(c, g);
            selectPriority(PriorityMenu, 5 - f.current_priority);
            return false
        });
        addClass(c, "form_action_icon menu_icon");
        swapDOM(b, c);
        AmiTooltip.showSimpleText(c, _("Set priority"));
        this.priority_button = c;
        return c
    };
    a.prototype.menuPriorityUpdated = function (b) {
        b = 5 - b;
        this.current_priority = b;
        PriorityMenu.hide(null, true);
        this.annotatePrioirtyButton(this.priority_button, b);
        return false
    };
    return a
})();
window.ItemEdit = new GItemEdit();
ItemDueDates = {
    create: function (n, b) {
        if (n.due_date) {
            var j = n.date_string;
            var f = SPAN({
                "class": "date"
            });
            var l = RecurringDates.isEveryDate(n.date_string);
            var a = DateBocks.getNow();
            var m = DateBocks.getNow();
            m.setDate(m.getDate() + 1);
            var g = DateController.isOverdue(a, n.due_date);
            var c = DateController.dayDiff(n.due_date);
            var h = DateController.humanizeDayDiff(c, n.due_date);
            var d = c <= 7 && c >= -7;
            if (d) {
                addClass(f, "date_future")
            }
            if (!b && window.AmiTooltip) {
                AmiTooltip.showTooltip(f, $p(ItemDueDates._createTooltipContent, n))
            }
            ACN(f, h);
            if (DateController.hasTime(n.date_string)) {
                ACN(f, " @ " + DateController.getHourAndMin(n.due_date, Settings.AMPM))
            }
            if (DateController.sameDate(n.due_date, a)) {
                addClass(f, "date_today")
            } else {
                if (DateController.sameDate(n.due_date, m)) {
                    addClass(f, "date_tom")
                } else {
                    if (g) {
                        addClass(f, "date_overdue")
                    }
                }
            } if (l) {
                ATT(f, imageSprite("cmp_recurring", 12, 11, "recurring_icon"))
            }
            this.updateAlarmIcon(f, n.has_notifications);
            return f
        }
        var k = SPAN({
            "class": "date empty"
        });
        var i = this.updateAlarmIcon(k, n.has_notifications);
        if (i) {
            i.style.marginRight = "0px"
        }
        return k
    },
    _createTooltipContent: function (n) {
        var a = DateBocks.getNow();
        var g = DateController.isOverdue(a, n.due_date);
        var b = DateController.dayDiff(n.due_date);
        var d = b <= 7 && b >= -7;
        var k = RecurringDates.isEveryDate(n.date_string);
        var j = DateController.formatDate(n.due_date, !d || g);
        var i;
        var c = false;
        if (b > 0) {
            i = (b == 1 || b == -1) && _("day left") || _("days left")
        } else {
            if (b < 0) {
                b = Math.abs(b);
                i = (b == 1 || b == -1) && _("day ago") || _("days ago");
                c = true
            }
        } if (b != 0) {
            var m = "day_count";
            if (n.in_history == 1 || n.checked == 1) {
                m = "day_count day_done"
            } else {
                if (c) {
                    m = "day_count day_od"
                }
            }
            var h = '<span class="' + m + '">' + b + "</span> ";
            j += "<br /><small>" + h + i + "</small>"
        }
        if (k) {
            var l = n.date_string;
            j += "<br /><small> " + l + "</small>"
        }
        if (window.IsPremium && n.due_date) {
            j = setHTML(SPAN({
                c: "date_tooltip"
            }), j);
            var f = QuickDayShow.show(n.due_date);
            ACN(j, f)
        }
        return j
    },
    updateAlarmIcon: function (d, a) {
        var b = $bytc("img", "alarm_icon", d);
        if (b.length > 0) {
            removeElement(b[0])
        }
        var c;
        if (a) {
            appendToTop(d, c = imageSprite("cmp_alarm", 16, 16, "alarm_icon"))
        }
        return c
    },
    updateDueDate: function (a) {
        var c = $bytc("div", "div_due_date", a)[0];
        if (c) {
            var b = ItemDueDates.create(a.json);
            RCN(c, b);
            AJS.fx.highlight(a)
        }
    }
};
ItemForms = {
    doubleClick: function (b, a) {
        AEV(b, "mousedown", function (d) {
            if (d.button == 2) {
                return false
            }
            var f = getEventElm(d);
            if (hasClass(f, "clickable")) {
                return true
            }
            if (document.selection) {
                var c = document.selection.createRange().text;
                if (c) {
                    return true
                }
            }
            if (nodeName(f) == "input") {
                return true
            }
            if (d.ctrl || d.shift) {
                return true
            }
            if (f && nodeName(f) != "a" && !hasClass(f, "label")) {
                return a(d)
            }
            return true
        })
    },
    createDueInput: function (b) {
        var c = INPUT({
            type: "text",
            c: "input_due_date dp_icon",
            name: "due_date",
            tabIndex: 2,
            autocomplete: "off",
            placeholder: _("no due date")
        });
        var d = function () {
            c.date_string = "";
            c.no_date = true;
            MiniCal.reset();
            c.value = ""
        };
        var a = function (g, f) {
            var h = c.value || b.date_string || "";
            c.value = DateController.formatDateTime(g, h);
            c.date_string = DateController.jsonFormat(g, true);
            c.no_date = false;
            c.use_custom = false;
            MiniCal.setCurrentNoRender(g);
            if (window.I18N_LANG) {
                c.value = translate_to_lang(I18N_LANG, LANG, c.value)
            }
            if (isIe() && c.value) {
                removeClass(c, "dummy_text")
            }
            window.SHOULD_HIDE = true;
            setTimeout(function () {
                window.SHOULD_HIDE = false
            }, 15);
            try {
                c.focus()
            } catch (i) {}
            try {
                removeElement($bytc("span", "error", $f($gp(c, "form"))))
            } catch (i) {}
            MiniCal.remove()
        };
        if (b && b.due_date) {
            a(new Date(b.due_date), true)
        } else {
            d()
        }
        AEV(c, "keydown", function (f) {
            c.use_custom = true;
            if (f.keyAscii == 13) {
                MiniCal.remove();
                return false
            } else {
                if (f.keyAscii == 9 && !AmiComplete.shown()) {
                    MiniCal.remove();
                    setTimeout(function () {
                        if (b.due_date_focus) {
                            b.due_date_focus()
                        } else {
                            $f($gp(c, "form"), "ta").focus()
                        }
                    }, 10);
                    return false
                } else {
                    if (f.keyAscii == 27) {
                        preventDefault(f);
                        $gc($gp(c, "form"), "a", "cancel").onclick();
                        return false
                    }
                }
            }
        });
        AEV(c, ["focus", "click"], function (f) {
            if (window.SHOULD_HIDE || AmiComplete.shown()) {
                return
            }
            setTimeout(function () {
                if (MiniCal.click_elm != c) {
                    MiniCal.create(c)
                }
            }, 2)
        });
        MiniCal.onSelect = a;
        MiniCal.noDate = d;
        MiniCal.annotateInner = function (f) {
            var g = A({
                href: "#"
            }, imageSprite("cmp_info_on", 16, 16), " ", _("Recurring dates and more..."));
            AEV(g, "click", InfoPage.showDateInsert);
            ACN(f, DIV({
                c: "dp_no_due dp_help"
            }, g));
            ACN(f, QuickDayShow.renderHolder())
        };
        if (window.IsPremium) {
            MiniCal.annotateDate = function (g, f) {
                AEV(g, "mouseover", function () {
                    var h = QuickDayShow.show(f);
                    RCN($("quick_day_show"), h)
                })
            }
        }
        DummyText.attach(c, [c], _("no due date"));
        return c
    },
    genCancel: function (a, g, c, d) {
        d = d || _("Cancel");
        var f = A({
            "class": "cancel",
            href: "",
            tabIndex: 4
        }, d);
        var b = function (h) {
            var i = getParentBytc(f, a);
            removeElement(i);
            c.current_form = null;
            c.current_cancel = null;
            if (isFunction(g)) {
                g(h)
            }
            return false
        };
        f.onclick = b;
        return f
    },
    parseDueDate: function (c) {
        var b = [null, ""];
        if (c.value == "no due date" || c.value == _("no due date")) {
            return b
        }
        if (c.value != "") {
            var a = c.value;
            if (window.I18N_LANG) {
                c.value = translate_to_english(I18N_LANG, LANG, c.value)
            }
            b = DateController.getUTC(c.value);
            if (b == -1) {
                c.value = a;
                this.flashDateError(c);
                return false
            }
        }
        return b
    },
    flashDateError: function (f) {
        var d = $gp(f, "form");
        var a = f.parentNode;
        removeElement($bytc("span", "error", a));
        var c = A({
            href: "#"
        }, _("Help"));
        AEV(c, "click", InfoPage.showDateInsert);
        var b = SPAN({
            c: "error",
            s: "padding: 2px"
        }, _("Invalid date"), c);
        ATT(a, b);
        AmiButton.enable($gc(d, "a", "submit_btn"));
        f.focus();
        MiniCal.create(f)
    },
    parseFormData: function (a) {
        var j = getParentBytc(a, "li");
        if (j) {
            var c = j.previousSibling;
            var b = c && c.json && c.json.item_order + 1 || 1
        } else {
            var b = null
        }
        var g = {};
        var i = $f(a, "due_date");
        if (i.value == i.orginal_value) {}
        var d = ItemForms.parseDueDate(i);
        if (d == false) {
            return false
        }
        var h = 5 - ItemEdit.current_priority;
        var f = {
            content: $f(a, "ta").value,
            project_id: ProjectEditorManager.current_project_id,
            indent: j && GenericManagerUtils.getIndent(j) || 1,
            priority: h,
            due_date: d[0],
            date_string: DateUtils.normalizeDate(i.value),
            item_order: b
        };
        handleTextShortcuts(f);
        return f
    }
};
ItemsSortBy = {
    sortBy: function (c, b) {
        var a = ProjectEditorManager.current_editor;
        a.saveCurrentItem(function () {
            var f = ProjectGearMenu;
            actionPerfomed();
            var d = $FA(a.current_list.childNodes);
            var g = ItemsSortBy._sortListBy(d, 1, c, b);
            var h = UL({
                c: "items"
            });
            map(g, function (k, j) {
                h.appendChild(k)
            });
            swapDOM(a.current_list, h);
            a.current_list = h;
            a.saveOrder(function () {
                a.arrows.updateArrows()
            });
            f.hide(null, true)
        });
        return false
    },
    _sortListBy: function (f, b, j, d) {
        var k = [];
        var i = [];
        var c;
        var h;
        var a = {};
        map(f, function (o, n) {
            var m = o.json;
            if (m && m.indent == b) {
                if (d(m)) {
                    h = k
                } else {
                    h = i
                }
                h.push(o);
                c = m.id;
                a[c] = []
            } else {
                if (m) {
                    a[c].push(o)
                }
            }
        });
        k = k.sort(j);
        var g;
        g = k.concat(i);
        var l = [];
        map(g, function (p) {
            l.push(p);
            if (p.json) {
                var n = a[p.json.id];
                if (n && n.length > 0) {
                    var m = p.json.collapsed == 1;
                    var o = ItemsSortBy._sortListBy(n, n[0].json.indent, j, d);
                    l = l.concat(o)
                }
            }
        });
        return l
    },
    sortByDate: function () {
        ItemsSortBy.sortBy(ItemsSortBy._sortByDate, function (a) {
            return a.date_string != "" && a.due_date
        })
    },
    sortByPriority: function () {
        ItemsSortBy.sortBy(ItemsSortBy._sortByPriority, function (a) {
            return a.priority != 1
        })
    },
    sortByName: function () {
        ItemsSortBy.sortBy(ItemsSortBy._sortByName, function (a) {
            return a.content != null
        })
    },
    _sortByDate: function (d, c) {
        var g = d.json.due_date.getTime();
        var f = c.json.due_date.getTime();
        if (g < f) {
            return -1
        } else {
            if (g > f) {
                return 1
            }
        } if (g == f) {
            if (d.json.item_order > c.json.item_order) {
                return 1
            }
        }
        return -1
    },
    _sortByPriority: function (d, c) {
        var g = d.json.priority;
        var f = c.json.priority;
        if (g == f) {
            return 0
        }
        if (g > f) {
            return -1
        } else {
            return 1
        }
    },
    _sortByName: function (d, c) {
        var g = d.json.content.toLowerCase();
        var f = c.json.content.toLowerCase();
        if (g == f) {
            return 0
        }
        if (g < f) {
            return -1
        } else {
            return 1
        }
    }
};
var GQuickDayShow, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GQuickDayShow = (function () {
    function a() {
        this.hide = __bind(this.hide, this);
        this.show = __bind(this.show, this)
    }
    a.prototype.renderHolder = function () {
        return DIV({
            id: "quick_day_show"
        })
    };
    a.prototype.show = function (b) {
        var n, j, d, i, h, l, m, g, f, k, c;
        j = ItemsQueries.getByDate(b);
        if (j.length === 0) {
            m = _("No tasks due")
        } else {
            if (j.length === 1) {
                m = _("1 task due")
            } else {
                m = _("%s tasks due").replace("%s", j.length)
            }
        }
        h = DIV({
            c: "project_bar"
        });
        i = [];
        for (g = 0, k = j.length; g < k; g++) {
            n = j[g];
            l = ProjectsModel.get(n.project_id);
            if (l) {
                d = CompletedQuickVisualize.getProjectColor(l, 8);
                i.push([l.color, d])
            }
        }
        i.sort(function (p, o) {
            return p[0] - o[0]
        });
        for (f = 0, c = i.length; f < c; f++) {
            d = i[f];
            ACN(h, d[1])
        }
        return DIV({
            c: "project_bar_holder"
        }, m, CENTER(h))
    };
    a.prototype.hide = function () {
        return RCN($("quick_day_show"), null)
    };
    return a
})();
window.QuickDayShow = new GQuickDayShow();
var refreshInterface;
refreshInterface = function (b) {
    var d, g, f, c, a;
    d = GB_getLast() || window.EDIT_ON || DragAndDrop.current_mode === "reordering";
    if (ProjectEditorManager.current_form || EditorMenu.shown || AgendaEditMenu.shown) {
        d = true
    }
    if (d) {
        return setTimeout($p(refreshInterface, b), 500)
    } else {
        Agenda.updateCounters();
        ProjectList.insertItems(ProjectsModel.getAll());
        if (ProjectEditorManager.current_editor && b) {
            g = [];
            for (c = 0, a = b.length; c < a; c++) {
                f = b[c];
                g.push(f.id)
            }
            return Signals.sendSignal("projects.rerender", g)
        } else {
            if ($("agenda_view")) {
                return Agenda.refresh()
            }
        }
    }
};
Signals.connect("refresh_interface", refreshInterface);
LocationManager = {
    cur_location: window.location.hash,
    iframe: null,
    init: function () {
        setInterval(this.locationPolling, 500);
        TemporaryIds.listenAll(function (b, a) {
            var c = LocationManager;
            if (c.cur_location.indexOf(b) != -1) {
                c.updateLocation(c.cur_location.replace(b, "" + a))
            }
        })
    },
    updateLocation: function (b) {
        var a = LocationManager;
        b = b.replace(/\s+/g, "__");
        if (a.cur_location != "#" + b) {
            window.location.hash = b;
            a.cur_location = window.location.hash
        }
        a.cur_location_last = b
    },
    updateLocationOnly: function (a) {
        LocationManager.updateLocation(a)
    },
    refreshView: function () {
        var a = window.location.hash;
        LocationManager.updateView(a);
        return false
    },
    updateView: function (c) {
        c = c.replace("#", "");
        if (c.indexOf("project/") == 0) {
            p_id = parseInt(c.split("/")[1]);
            if (p_id) {
                ProjectList.setCurrentById(p_id, false)
            }
        } else {
            if (c.indexOf("email_tasks/") == 0) {
                p_id = parseInt(c.split("/")[1]);
                if (p_id) {
                    ProjectList.setCurrentById(p_id, false);
                    ProjectExtraOptions.showEmails(p_id)
                }
            } else {
                if (c.indexOf("agenda/") == 0) {
                    query = c.split("/")[1];
                    if (query) {
                        query = query.replace(/__/g, " ");
                        try {
                            query = unescape(query)
                        } catch (b) {
                            AJS.log(b)
                        }
                        Agenda.query(query, false)
                    }
                } else {
                    if (c.indexOf("completed_visual") != -1) {
                        CompletedHistory.showHistory(true)
                    } else {
                        if (c.indexOf("karma_info") != -1) {} else {
                            if (c.indexOf("completed") != -1) {
                                CompletedHistory.showHistory()
                            } else {
                                if (c.indexOf("info_page") != -1) {
                                    window.InfoPage && InfoPage.showIfPossible();
                                    var a = c.split("/");
                                    if (a.length == 2) {
                                        switch (a[1]) {
                                        case "labels":
                                            InfoPage.showLabels();
                                            break;
                                        case "reminders":
                                            InfoPage.showReminders();
                                            break;
                                        case "date_insert":
                                            InfoPage.showDateInsert();
                                            break;
                                        case "filters":
                                            InfoPage.showFilters();
                                            break;
                                        case "keyboard_shortcuts":
                                            InfoPage.showKeyboardShortcuts();
                                            break;
                                        case "formatting":
                                            InfoPage.showFormatting();
                                            break;
                                        case "notes":
                                            InfoPage.showNotes();
                                            break
                                        }
                                    }
                                } else {
                                    if (c.indexOf("quickAdd") != -1) {
                                        QuickAddTasks.toggle();
                                        c = LocationManager.cur_location;
                                        window.location.hash = c
                                    } else {
                                        if (c.indexOf("sync") != -1) {
                                            SyncEngine.sync(null, true);
                                            c = LocationManager.cur_location;
                                            window.location.hash = c
                                        } else {
                                            if (c.indexOf("openOutlook") != -1 || c.indexOf("openThunderbird") != -1) {} else {
                                                showStartPage(false);
                                                if (c == "upgrade_to_premium") {
                                                    c = "windowPref/premium"
                                                }
                                                if (c == "invite_friends") {
                                                    c = "windowPref/invite_friends"
                                                }
                                                if (c.indexOf("windowPref/") == 0) {
                                                    WindowOpener.showPrefs(getLast(c.split("/")))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return c
    },
    locationPolling: function () {
        var a = LocationManager;
        var b = window.location.hash;
        if (a.cur_location.replace("#", "") != b.replace("#", "")) {
            if (isSafari()) {
                window.location.hash = urldecode(b)
            } else {
                window.location.hash = b
            }
            b = a.updateView(b);
            a.cur_location = b
        }
    }
};
ItemSelecter = {
    init: function () {
        AEV(window, "scroll", this.reposition)
    },
    selectClick: function (a) {
        AEV(a, "contextmenu", function (b) {
            if (isMac()) {
                if (b.meta) {
                    preventDefault(b)
                }
            } else {
                if (b.ctrl) {
                    preventDefault(b)
                }
            }
        });
        AEV(a, "mousedown", function (b) {
            var c = getEventElm(b);
            if (c && (hasClass(c, "amicheckbox") || hasClass(c, "amicheckbox_img")) && b.shift) {
                return true
            }
            if ((isMac() && b.meta) || (!isMac() && b.ctrl) || b.shift) {
                preventDefault(b);
                return ItemSelecter._selectClick(c)
            }
        })
    },
    _selectClick: function (b) {
        if (b && (hasClass(b, "amicheckbox") || hasClass(b, "amicheckbox_img"))) {
            return false
        }
        var a = $gp(b, "li");
        ItemSelecter.toggle(a);
        if (document.selection && document.selection.empty) {
            document.selection.empty()
        } else {
            getBody().focus()
        }
        return false
    },
    showSelector: function () {
        var a = $bytc("li", "selected");
        if (a.length == 0) {
            this.hideSelecta()
        } else {
            this.showSelecta()
        }
    },
    hideSelecta: function () {
        removeClass(getBody(), "selected_top");
        removeElement($("item_commander"))
    },
    showSelecta: function () {
        addClass(getBody(), "selected_top");
        if (!$("item_commander")) {
            var f, b, g, d, a, c;
            appendToTop(getBody(), DIV({
                id: "item_commander"
            }, this.postpone_date = a = A({
                href: "#"
            }, _("Postpone")), c = A({
                href: "#"
            }, _("Do it Today")), this.change_date = d = A({
                href: "#"
            }, _("Change date")), g = A({
                href: "#"
            }, _("Move to project")), b = A({
                href: "#"
            }, _("Delete")), f = A({
                href: "#",
                id: "deselect_items"
            }, _("Deselect all"))));
            AEV(f, "click", $b(this.deselectAll, this));
            AmiTooltip.showTooltip(a, _("Postpone to another day"));
            AmiTooltip.showTooltip(d, _("Change date of task"));
            AEV(d, "click", $b(this.changeDate, this));
            AEV(c, "click", $b(this.doItToday, this));
            AEV(a, "click", $b(this.postPone, this));
            AEV(b, "click", $b(this.deleteItems, this));
            AEV(g, "click", $b(this.moveItems, this))
        }
        this.reposition()
    },
    enableAll: function () {
        map($bytc("li", "selected"), function (a) {
            a.disabled = false
        })
    },
    deselectAll: function () {
        if (getCurrentActionPerfomed() != "ItemSelecter/toggle") {
            removeClass($bytc("li", "selected"), "selected");
            this.hideSelecta()
        }
        return false
    },
    toggle: function (a) {
        actionPerfomed("ItemSelecter/toggle");
        if (hasClass(a, "selected")) {
            removeClass(a, "selected")
        } else {
            addClass(a, "selected")
        }
        this.showSelector();
        return false
    },
    reposition: function () {
        var b = $("item_commander");
        if (b) {
            var a = getWindowSize();
            var c = (a.w - b.offsetWidth) / 2;
            if (window.IS_MINI) {
                setLeft(b, 0)
            } else {
                setLeft(b, c)
            }
            setTop(b, getScrollTop())
        }
    },
    getProjectItems: function (a) {
        var c = {};
        var b = {};
        map(a, function (f) {
            if (!f.json || c[f.json.id]) {
                return
            }
            f.disabled = true;
            var d = f.json.project_id;
            if (!b[d]) {
                b[d] = []
            }
            b[d].push(f.json.id);
            map(ItemsModel.getChildren(f.json, false), function (g) {
                if (!c[g.id]) {
                    b[d].push(g.id);
                    c[g.id] = true
                }
            })
        });
        return b
    },
    deleteItems: function () {
        var a = $bytc("li", "selected");
        var b = this.getProjectItems(a);
        map(keys(b), function (d) {
            ItemsModel.deleteItem(b[d], d)
        });
        var c = [];
        map(a, function (d) {
            removeElement(d);
            c.push(d.json)
        });
        ItemCommonEdits.notifyDeletedItems(c);
        if (ProjectEditorManager.current_editor) {
            ProjectEditorManager.checkEmpty()
        }
        ItemSelecter.deselectAll();
        ItemSelecter.enableAll();
        return false
    },
    moveItems: function (b) {
        var a = $bytc("li", "selected");
        var c = ItemSelecter.getProjectItems(a);
        MoveItems.showOverlay();
        GB_getLast().addCallback(function () {
            MoveItems.resetProjectList();
            var d = MoveItems.selected_project;
            if (d) {
                MoveItems.doMoveItemsRequest(c, d)
            }
            ItemSelecter.enableAll();
            if (b && isFunction(b)) {
                b()
            }
        });
        return false
    },
    postPone: function () {
        Postpone.postPoneUpdate($bytc("li", "selected"));
        return false
    },
    doItToday: function () {
        DoItToday.changeToToday($bytc("li", "selected"));
        return false
    },
    changeDate: function () {
        var b = $bytc("li", "selected");
        if (b.length == 0) {
            alert("You must select some tasks");
            return false
        }
        AmiTooltip.hide();
        var a, d, c;
        d = AmiButton.createButton(_("Change"));
        addClass(d, "amibutton_red");
        var a = ItemForms.createDueInput({});
        setStyle(a, {
            "margin-right": "20px"
        });
        var f = DIV({
            c: "change_date",
            s: "text-align: left !important;"
        }, FORM({
            s: "margin: 5px 10px"
        }, DIV({
            s: "margin: 5px 0;"
        }, c = DIV({
            s: "color: red; margin-bottom: 8px; font-weight: bold;"
        }), DIV({
            c: "due_date_holder",
            s: "margin-right: 8px;"
        }, a), d)));
        hideElement(c);
        var g = function () {
            var j = a.value;
            if (j == "") {
                var i = ["", ""]
            } else {
                if (window.I18N_LANG) {
                    j = translate_to_english(I18N_LANG, LANG, j)
                }
                var i = DateController.getUTC(j);
                setHTML(c, "");
                if (!i || i == -1) {
                    showElement(c);
                    setHTML(c, _("Invalid date"));
                    a.select();
                    return false
                }
            }
            var h = [];
            map(b, function (l) {
                var m = {
                    due_date: i && i[0] || null
                };
                if (!RecurringDates.isEveryDate(l.json.date_string)) {
                    m.date_string = j
                }
                h.push(l);
                var k = ItemsModel.update(l.json.id, m);
                update(l.json, k[0])
            });
            ItemSelecter._updateDueDates(h);
            Agenda.updateCounters();
            setEditOff();
            GB_hide();
            return false
        };
        AEV(d, "click", g);
        attachKeyDown(a, function (h) {
            if (h.keyAscii == 13) {
                return g()
            }
            if (h.keyAscii == 27) {
                setEditOff();
                GB_hide()
            }
        });
        setEditOn();
        GB_showHTML(_("Change date"), f, 400, 250);
        a.focus();
        return false
    },
    _updateDueDates: function (c, b, d) {
        var a = ProjectEditorManager.current_editor;
        map(c, function (f) {
            if (f.json) {
                map($bytc("li", "item_" + f.json.id), function (g) {
                    var h;
                    if (a) {
                        h = a.renderItem(g.json)
                    } else {
                        h = Agenda.renderItem(g.json, g.render_opts)
                    }
                    h.disabled = false;
                    if (d) {
                        ATT($gp(g, "ul"), h);
                        removeElement(g)
                    } else {
                        swapDOM(g, h)
                    }
                })
            }
        });
        if (!a) {
            Agenda.refresh()
        }
        setEditOff();
        if ($bytc("li", "selected").length == 0) {
            ItemSelecter.hideSelecta()
        }
        Agenda.updateCounters()
    }
};
AEV(window, "load", $b(ItemSelecter.init, ItemSelecter));
var GPromotionOverlay, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GPromotionOverlay = (function () {
    function a() {
        this.show = __bind(this.show, this)
    }
    a.prototype.show = function (g, f) {
        var b, c, d;
        d = 500;
        b = 600;
        if (window.IS_MINI) {
            d = 290;
            b = 200
        }
        c = this.renderHolder(g, f);
        return GB_showHTML(_("Premium Only Feature"), c, b, d)
    };
    a.prototype.renderHolder = function (d, c) {
        var b;
        c = _("<a>Upgrade to Todoist Premium for instant access</a> to this and a lot of other features").replace("<a>", '<a href="/PremiumLanding/show" onclick="return top.WindowOpener.showPrefs(\'premium\');">');
        if (window.IS_MINI) {
            c = c.replace("</a>", "</a><br>")
        }
        b = DIV(DIV({
            c: "premium_only"
        }, DIV({
            c: "p_header"
        }, setHTML(SPAN(), d)), DIV({
            c: "text"
        }, setHTML(SPAN(), c))));
        return b
    };
    return a
})();
window.PromotionOverlay = new GPromotionOverlay();
GLabelsExtended = Class({
    init: function () {
        bindMethods(this);
        this.initMenu();
        AmiComplete.callbacks.on_show.push(this.onShowCallback);
        AmiComplete.callbacks.on_hide.push(this.onHideCallback)
    },
    initMenu: function () {
        LabelMenu = new AmiMenu();
        LabelMenu.hide_menu_icon = true;
        LabelMenu.addItems(createItem(_("Edit label"), $p(this.editCurrentItem, null)), createItem(_("Delete label"), this.deleteCurrentItem), createSeparator(), LabelMenu.colors = createColor(Labels.colors, this.setColor));
        AEV(document, "click", LabelMenu.hide)
    },
    annotateFormArea: function (a, b) {
        AmiComplete.attach(a, {
            collection: function () {
                return LabelsExtended.getCompletionLabels()
            },
            filterItem: function (d, c) {
                return setHTML(SPAN(), c)
            },
            position_item: $gp(a, "td", "text_box_holder"),
            extra_width: 1
        });
        AEV(a, "keydown", function (c) {
            AmiComplete.hide_manage = false;
            if (c.keyAscii == 13 && !c.shift) {
                if (AmiComplete.shown()) {
                    return false
                }
            }
            if (c.keyAscii == 27) {
                if (AmiComplete.shown()) {
                    return false
                }
            }
        });
        swapDOM(b, this._crateLabelButton(a))
    },
    setCurrentItem: function () {
        if (LabelMenu.current_holder) {
            this.current_item = LabelMenu.current_holder;
            LabelMenu.current_holder = null
        }
    },
    saveItem: function () {
        var d = this.current_form;
        if (!d) {
            return
        }
        var c = getParentBytc(d, "li");
        var a = c.previousSibling;
        var h = $f(d, "ta");
        var b = a.json.name;
        var g = h.value;
        var f = this._testLabelName(g, h);
        if (!f) {
            return
        }
        g = g.replace(/[\s&]/, "_");
        LabelsModel.updateLabel(a.json.id, {
            name: g
        });
        $bytc("span", "label_big", a, true).innerHTML = g;
        removeElement(c);
        showElement(a);
        this.current_form = null;
        return false
    },
    _testLabelName: function (a) {
        if (a == "") {
            alert(_("Name can't be empty."));
            return false
        }
        return true
    },
    _editCurrentItem: function (b) {
        var c = getEventElm(b);
        if (hasClass(c, "label_big")) {
            return
        }
        var a = c;
        if (nodeName(a) != "li") {
            a = getParentBytc(c, "li")
        }
        if (isClickAble(c)) {
            this.editCurrentItem(a)
        }
        return false
    },
    _onCancel: function (a) {
        if (a) {
            showElement(a)
        }
        this.current_form = null;
        this.checkEmpty();
        return false
    },
    addItem: function (c, h) {
        var a = getParentBytc(c, "li");
        var g = $f(c, "ta");
        var f = g.value;
        var d = this._testLabelName(f, g);
        if (!d) {
            return
        }
        f = f.replace(/[\s&]/, "_");
        var b = LabelsModel.addLabel(f);
        ATT($("label_view"), this.renderItem(b));
        removeElement(a);
        this.current_form = null;
        return false
    },
    showAddItem: function () {
        this.saveItem();
        var b = {
            cancel: ItemForms.genCancel("li", $p(this._onCancel, null), this),
            action: this.addItem,
            submit_val: _("Add label"),
            submit_icon: "cmp_add",
            name_val: ""
        };
        var a = ProjectList.generateAddEditForm(b);
        this.current_form = a.form;
        b.onKeyPress = function (c) {
            if (c.keyAscii == 13) {
                b.action(a.form);
                return false
            }
        };
        ATT($("label_view"), a.li_item);
        a.textarea.resize();
        LibEdit.placeCursor(a.textarea, 0);
        this.checkEmpty();
        return false
    },
    editCurrentItem: function (a) {
        this.setCurrentItem();
        a = a || this.current_item;
        this.saveItem();
        var c = {
            cancel: ItemForms.genCancel("li", $p(this._onCancel, a), this),
            action: this.saveItem,
            submit_val: "Save",
            submit_icon: "cmp_save",
            name_val: a.json.name,
            current_item: a
        };
        var b = ProjectList.generateAddEditForm(c);
        this.current_form = b.form;
        c.onKeyPress = function (d) {
            if (d.keyAscii == 32) {
                alert(_("Labels can't have spaces. Use _ instead."));
                return false
            }
            if (d.keyAscii == 13) {
                c.action(b.form);
                return false
            }
        };
        hideElement(a);
        insertAfter(b.li_item, a);
        b.textarea.resize();
        LibEdit.placeCursor(b.textarea, a.json.name.length);
        LabelMenu.hide(null, true)
    },
    deleteCurrentItem: function () {
        LabelsExtended.setCurrentItem();
        var a = LabelsExtended.current_item;
        Alerts.confirm(_("Are you sure you want to delete %s?").replace("%s", a.json.name), function (b) {
            if (b) {
                LabelsModel.deleteLabel(a.json.id);
                removeElement(a);
                LabelsExtended.checkEmpty()
            }
        })
    },
    renderItem: function (k) {
        var j = LI({
            c: "task_item"
        });
        j.json = k;
        var a, f, g, d;
        var c = j.menu_icon = GenericManagerUtils.getMenuEditIcon(j);
        var h = $p(this.toggleMenu, j, c);
        AEV(c, "click", h);
        new MenuRightClick(j, h);
        var b = SPAN({
            "class": "label_big"
        }, k.name);
        AEV(b, "mousedown", function (l) {
            Labels.queryLabel(b);
            return false
        });
        var i = SPAN({
            style: "margin-right: 5px;"
        }, "" + (k.count || 0));
        ACN(j, TABLE({
            "class": "text_cursor",
            width: "100%"
        }, d = TBODY(TR(a = TD({
            "class": "count"
        }, i), f = TD({
            "class": "content text"
        }, b), g = TD({
            "class": "menu"
        }, c)))));
        if (k.count == 0) {
            setOpacity(a, 0.6);
            setOpacity(f, 0.6)
        }
        this._changeColor(j, k.color);
        ItemForms.doubleClick(f, this._editCurrentItem);
        ItemForms.doubleClick(a, this._editCurrentItem);
        GenericManagerUtils.attachMenuIconListeners(j);
        return j
    },
    checkEmpty: function () {
        if (this.ul.childNodes.length == 0) {
            ACN(this.ul, LI({
                c: "empty"
            }, _("You have no labels.")));
            insertAfter(P({
                c: "empty content",
                style: "color: #222 !important"
            }, _("You can attach a label by adding %s to an task's content.").replace("%s", "@label"), " ", setHTML(SPAN(), '<a href="/Help/viewLabels" class="action" onclick="return GB_show(\'Labels\', this.href, 500, 600)">' + _("Learn more...") + "</a>")), this.ul)
        } else {
            map($bytc("li", "empty", this.ul), removeElement)
        }
    },
    renderLabels: function (d, c) {
        var a = A({
            href: "#",
            c: "action add_new_label"
        }, _("Add new label"));
        AEV(a, "click", this.showAddItem);
        ACN(d, H2({
            c: "section_header"
        }, _("Your labels"), a));
        var b;
        ACN(d, b = UL({
            id: "label_view",
            c: "items day_list"
        }));
        this.ul = b;
        map(c, function (f) {
            ACN(b, LabelsExtended.renderItem(f))
        });
        this.checkEmpty()
    },
    toggleMenu: function (b, c, a) {
        LabelMenu.toggle({
            id: b.json.id
        }, b, a);
        this.onShowMenu(b)
    },
    setColor: function (a, c) {
        this.setCurrentItem();
        var b = this.current_item;
        if (b.json.color != a && c) {
            LabelsModel.updateLabel(b.json.id, {
                color: a
            });
            addClass(c, "selected_color");
            LabelsExtended._resetColors(c);
            LabelsExtended._changeColor(b, a)
        }
        LabelMenu.hide(null, true)
    },
    _resetColors: function (a) {
        map($FA(a.parentNode.childNodes), function (b) {
            removeClass(b, "selected_color");
            removeClass(b, "hovering")
        })
    },
    _changeColor: function (c, b) {
        c.json.color = b;
        var a = $bytc("span", "label_big", c)[0];
        a.style.color = Labels.colors[b]
    },
    onShowMenu: function (b) {
        var a = $bytc("li", "colors", LabelMenu.colors.view)[0];
        var c = b.json.color;
        map($FA(a.childNodes), function (f, d) {
            if (d == c) {
                addClass(f, "selected_color")
            } else {
                setHTML(f, "");
                removeClass(f, "selected_color")
            }
        })
    },
    getCompletionLabels: function () {
        var a = [];
        var b = keys(LabelsModel.labels);
        b.sort();
        map(b, function (c) {
            a.push({
                name: c
            })
        });
        return a
    },
    onShowCallback: function (b, c) {
        if (AmiComplete.hide_manage) {
            return
        }
        if (AmiComplete.shown()) {
            var a = $("manage_labels_bar");
            if (!a) {
                a = this._createToolbar(b)
            }
            var d = absolutePosition(c);
            setTop(a, d.y + c.offsetHeight);
            setLeft(a, d.x);
            setWidth(a, c.offsetWidth - 2);
            showElement(a)
        }
    },
    onHideCallback: function (a, b) {
        hideElement($("manage_labels_bar"))
    },
    _createToolbar: function (b) {
        var c = A({
            c: "action",
            href: "#"
        }, _("Manage labels"));
        c.id = "btn_manage_labels";
        AEV(c, "click", function () {
            if (QuickAddTasks.shown) {
                QuickAddTasks.hide()
            }
            Agenda.query("@");
            return false
        });
        var d = imageSprite("cmp_small_close", 16, 16);
        addClass(d, "close_img"), AEV(d, "click", function (f) {
            AmiComplete.current_input._word = "";
            AmiComplete.current_input.focus();
            AmiComplete.hide();
            return false
        });
        var a = DIV({
            id: "manage_labels_bar",
            c: "amicomplete_manager"
        }, DIV(d, " ", c));
        hideElement(a);
        ACN(getBody(), a);
        return a
    },
    _crateLabelButton: function (a) {
        var b = imageSprite("cmp_label", 16, 16);
        addClass(b, "form_action_icon");
        AEV(b, "click", function (c) {
            AmiComplete.forceShow(a, true);
            return false
        });
        AmiTooltip.showSimpleText(b, _("Attach a label"));
        return b
    }
});
var GRenderQueryViewAll, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GRenderQueryViewAll = (function () {
    function a() {
        this.render = __bind(this.render, this)
    }
    a.prototype.render = function (d, i, c) {
        var h, g, f, b;
        h = [];
        for (f = 0, b = c.length; f < b; f++) {
            g = c[f];
            h.push(g.id)
        }
        return ProjectEditorManager.showProjects(h, null, {
            holder: i,
            update_location: false
        })
    };
    return a
})();
window.RenderQueryViewAll = new GRenderQueryViewAll();
var GRenderQuerySearch, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GRenderQuerySearch = (function () {
    function a() {
        this.renderItem = __bind(this.renderItem, this);
        this.renderItems = __bind(this.renderItems, this);
        this.fetchFromServer = __bind(this.fetchFromServer, this);
        this.render = __bind(this.render, this)
    }
    a.prototype.render = function (c, g, f) {
        var d, b;
        b = DIV({
            c: "search_holder"
        });
        ACN(g, b);
        ACN(b, H2({
            c: "section_header"
        }, f.name));
        this.renderItems(b, f.items, true);
        if (!f.is_filtered) {
            ACN(b, d = A({
                href: "#",
                c: "action search_completed"
            }, _("Search completed tasks...")));
            return AEV(d, "click", $p(this.fetchFromServer, b, d, f.query))
        }
    };
    a.prototype.fetchFromServer = function (h, d, f) {
        var c, b, g = this;
        if (!window.User.is_premium) {
            alert(_("Full text search is only available for premium users."));
            return
        }
        removeElement(d);
        b = DIV(Indicator.indicatorImg());
        ACN(h, b);
        c = loadJSON("/Agenda/queryFulltext");
        c.offline_message = true;
        c.addCallback(function (i) {
            var j;
            if (i.projects) {
                map(values(i.projects), function (k) {
                    return ItemsRender.temporary_projects[k.id] = k
                })
            }
            ACN(b, j = UL({
                "class": "items",
                style: "margin-bottom: 9px;"
            }));
            RCN(b, null);
            return g.renderItems(b, i.history, false)
        });
        c.sendReq({
            query: f,
            only_history: 1
        });
        return false
    };
    a.prototype.renderItems = function (b, i, h) {
        var k, f, g, d, j, c;
        f = UL({
            "class": "items",
            style: "margin-bottom: 9px;"
        });
        if (i.length === 0) {
            ACN(f, LI({
                c: "no_tasks"
            }, _("No tasks matches your query"), "."))
        } else {
            for (g = 0, j = i.length; g < j; g++) {
                k = i[g];
                ItemsModel.convertToDateObject(k)
            }
            i.sort($p(RenderQueryLabelPriority.labelPrioritySort, true));
            for (d = 0, c = i.length; d < c; d++) {
                k = i[d];
                this.renderItem(f, k, h)
            }
        }
        return ACN(b, f)
    };
    a.prototype.renderItem = function (c, d, f) {
        var b;
        if (f == null) {
            f = false
        }
        d = ItemsModel.getById(d.id) || d;
        if (d.due_date) {
            d.due_date = new Date(d.due_date)
        }
        b = Agenda.renderItem(d, {
            with_due_date: true,
            with_time: false,
            with_project: true,
            no_indent: true,
            no_drag_and_drop: true
        });
        ACN(c, b);
        return Agenda.displayArrows(d, b)
    };
    return a
})();
window.RenderQuerySearch = new GRenderQuerySearch();
var GRenderQueryLabelPriority, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GRenderQueryLabelPriority = (function () {
    function a() {
        this.labelPrioritySort = __bind(this.labelPrioritySort, this);
        this.render = __bind(this.render, this)
    }
    a.prototype.render = function (j, b, f, l, h) {
        var k, i, d, c, g;
        if (h == null) {
            h = true
        }
        ACN(b, DIV(H2({
            c: "section_header"
        }, l)));
        d = UL({
            "class": "items priority_list",
            style: "margin-bottom: 9px;"
        });
        if (f.length === 0) {
            ACN(d, LI({
                c: "no_tasks"
            }, _("No tasks matches your query")))
        } else {
            j.display_date = false;
            f.sort($p(this.labelPrioritySort, h));
            for (c = 0, g = f.length; c < g; c++) {
                k = f[c];
                i = j.renderItem(k, {
                    with_due_date: true,
                    with_time: false,
                    with_project: true,
                    no_indent: true,
                    no_drag_and_drop: true
                });
                ACN(d, i);
                j.displayArrows(k, i)
            }
        }
        return ACN(b, d)
    };
    a.prototype.labelPrioritySort = function (h, g, d) {
        var c, f;
        if (h) {
            if (g.priority > d.priority) {
                return -1
            } else {
                if (g.priority < d.priority) {
                    return 1
                }
            }
        }
        if (DateController.sameDate(g.due_date, d.due_date)) {
            c = DateController.hasTime(g.date_string);
            f = DateController.hasTime(d.date_string);
            if (c && f) {
                if (g.due_date > d.due_date) {
                    return 1
                } else {
                    return -1
                }
            } else {
                if (c && !f) {
                    return -1
                } else {
                    if (!c && f) {
                        return 1
                    }
                }
            } if (g.project_id === d.project_id) {
                return 0
            } else {
                return g.project_id > d.project_id
            }
        }
        if (g.due_date && !d.due_date) {
            return -1
        }
        if (!g.due_date && d.due_date) {
            return 1
        }
        if (g.due_date === d.due_date) {
            return 0
        }
        if (g.due_date > d.due_date) {
            return 1
        }
        if (g.due_date < d.due_date) {
            return -1
        }
    };
    return a
})();
window.RenderQueryLabelPriority = new GRenderQueryLabelPriority();
var GRenderQueryDays, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GRenderQueryDays = (function () {
    function a() {
        this._renderDayHeader = __bind(this._renderDayHeader, this);
        this.render = __bind(this.render, this)
    }
    a.prototype.render = function (g, k, t, l, j) {
        var q, n, p, f, h, m, o, i, d, c, b, r, u, s;
        if (j == null) {
            j = true
        }
        if (j) {
            l = DayOrders.annotate(l)
        } else {
            l = l.sort(UtilModels.daySort)
        }
        g.display_date = true;
        ACN(k, n = DIV());
        if (t) {
            ACN(n, this._renderDayHeader(t, true))
        }
        ACN(n, i = UL({
            "class": "items day_list"
        }));
        if (!j) {
            addClass(i, "is_filtered")
        }
        i.day_date = t;
        if (l.length === 0) {
            addClass(n, "no_tasks")
        }
        f = [];
        p = [];
        for (d = 0, r = l.length; d < r; d++) {
            q = l[d];
            if (DateController.hasTime(q.date_string)) {
                p.push(q)
            } else {
                f.push(q)
            }
        }
        p.sort(function (w, v) {
            return w.time - v.time
        });
        m = {};
        if (!j) {
            m.no_day_ordering = true
        }
        for (c = 0, u = p.length; c < u; c++) {
            q = p[c];
            ACN(i, h = g.renderItem(q, m));
            g.displayArrows(q, h)
        }
        o = LI({
            c: "agenda_item reorder_item",
            s: "font-size: 0; height: 0px; padding: 0;"
        });
        ACN(i, o);
        o.json = {
            due_date: t
        };
        f.sort(function (w, v) {
            return w.day_order - v.day_order
        });
        for (b = 0, s = f.length; b < s; b++) {
            q = f[b];
            ACN(i, h = g.renderItem(q, m));
            g.displayArrows(h.json, h)
        }
        return ACN(k, i)
    };
    a.prototype._renderDayHeader = function (k, f) {
        var c, i, b, h, g, d, j;
        b = Math.abs(DateController.dayDiff(k));
        i = DateBocks.getNow();
        g = DateController.sameDate(k, i);
        h = k.getTime() < i.getTime();
        if (h && !g) {
            j = H2({
                c: "section_header"
            });
            c = "DD4B39";
            if (b === 1) {
                setHTML(j, "Yesterday");
                ACN(j, SPAN({
                    "class": "h2_date"
                }, DateController.formatDate(k, true)))
            } else {
                setHTML(j, b + " days ago");
                ACN(j, SPAN({
                    "class": "h2_date"
                }, DateController.formatDate(k, true)))
            }
            addClass(j, "overdue");
            if (f) {
                j.style.color = "#" + c
            }
        } else {
            if (b === 0) {
                j = H2(_("Today"));
                d = true
            } else {
                if (b === 1) {
                    j = H2(_("Tomorrow"));
                    d = true
                } else {
                    j = H2(DateController.getFullWDay(k));
                    d = false
                }
            }
            addClass(j, "section_header");
            ACN(j, SPAN({
                "class": "h2_date"
            }, DateController.formatDate(k, d)))
        }
        return j
    };
    return a
})();
window.RenderQueryDays = new GRenderQueryDays();
var GAgendaAutoComplete, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GAgendaAutoComplete = (function () {
    function a() {
        this.attach = __bind(this.attach, this)
    }
    a.prototype.mode = "labels";
    a.prototype.attach = function (h) {
        var b, j, f, k, g, i, c, d;
        j = function () {
            return LabelsExtended.getCompletionLabels()
        };
        c = function (m, l) {
            return setHTML(SPAN(), l)
        };
        g = function (n, m, l) {
            return AmiComplete.tdOnclick(n, m, l)
        };
        f = function () {
            return ProjectsModel.getAll()
        };
        d = function (n, l) {
            var m;
            m = setHTML(SPAN(), l);
            return ATT(m, ProjectItemCounter.createColor(n, false))
        };
        i = function (n, m, l) {
            AmiComplete.hide();
            Agenda.blur();
            ProjectList.setCurrentById(m.id);
            return false
        };
        k = function (m, l, n) {
            if (!l._word && m.keyAscii === 64) {
                n.trigger = "@";
                n.collection = j;
                n.filterItem = c;
                n.onclick = g
            }
            if (!l._word && m.keyAscii === 35) {
                n.trigger = "#";
                n.collection = f;
                n.filterItem = d;
                return n.onclick = i
            }
        };
        b = {
            keyPressListener: k
        };
        AmiComplete.attach(h, b);
        return AEV(h, "keydown", function (l) {
            AmiComplete.hide_manage = true;
            if (l.keyAscii === 13 && !l.shift) {
                if (AmiComplete.shown()) {
                    return false
                }
            }
            if (l.keyAscii === 27) {
                if (AmiComplete.shown()) {
                    return false
                }
            }
        })
    };
    return a
})();
window.AgendaAutoComplete = new GAgendaAutoComplete();
var GAgendaTranslate, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GAgendaTranslate = (function () {
    function a() {
        this.translate_to_lang = __bind(this.translate_to_lang, this);
        this.translate_to_english = __bind(this.translate_to_english, this)
    }
    a.prototype.translate_to_english = function (b) {
        return this._generic(window.translate_to_english, b)
    };
    a.prototype.translate_to_lang = function (b) {
        return this._generic(window.translate_to_lang, b)
    };
    a.prototype._generic = function (c, h) {
        var d, i, g, b, f;
        if (window.I18N_FILTERS) {
            i = [];
            f = h.split(",");
            for (g = 0, b = f.length; g < b; g++) {
                d = f[g];
                d = strip(d);
                if (d.length > 0) {
                    d = c(I18N_FILTERS, "" + LANG + "_filters", d)
                }
                i.push(d)
            }
            h = i.join(", ")
        }
        return h
    };
    return a
})();
window.AgendaTranslate = new GAgendaTranslate();
Agenda = Class({
    init: function () {
        bindMethods(this);
        var a = this.input = INPUT({
            "class": "input_q",
            type: "text text_box",
            placeholder: _("Filter tasks...")
        });
        if (window.User.is_premium) {
            AgendaAutoComplete.attach(a)
        }
        this.menu_query = generateAgendaQueryMenu(this);
        this.menu_edit = generateAgendaEditMenu(this);
        a.onfocus = setEditOn;
        a.onblur = setEditOff;
        attachKeyDown(a, function (b) {
            setEditOn();
            if (window.Mini && b.keyAscii == 13 && !AmiComplete.shown()) {
                setTimeout(window.Mini.hideController, 30)
            }
        });
        this.genereateAgendaArrows()
    },
    query: function (b, a) {
        Signals.sendSignal("agenda_query", b);
        if (window.Mini && a != false && b.indexOf("q:") == -1) {
            window.Mini.hideController()
        }
        document.title = b + ": Todoist";
        this.input._word = "";
        this.input.value = AgendaTranslate.translate_to_lang(b);
        Signals.sendSignal("hide_all_menus");
        if (b == "q: ") {
            LibEdit.placeCursor(this.input, this.input.value.length)
        } else {
            Agenda.showAgenda()
        }
        return false
    },
    showAgenda: function () {
        ProjectEditorManager.reset();
        RCN($("editor"), null);
        ProjectList.deselectCurrent();
        this._runQuery();
        return false
    },
    refresh: function (b, c) {
        if (b) {
            var a = $("item_" + b.id);
            if (a && !hasClass(a, "indent_1")) {
                return false
            }
        }
        if (b && c) {
            if (DateUtils.isSameDate(b.due_date, c.due_date) && b.priority == c.priority) {
                return false
            }
        }
        Agenda.showAgenda()
    },
    blur: function () {
        this.input.value = "";
        this.input._word = "";
        try {
            this.input.blur()
        } catch (a) {}
    },
    showError: function (f, b, c) {
        if (c == "premium") {
            var a = PromotionOverlay.renderHolder(f);
            RCN(b, a)
        } else {
            b = b || $("editor");
            var d = A({
                href: "#",
                c: "action"
            }, _("Show examples"));
            AEV(d, "click", showQuerySyntax);
            RCN(b, DIV({
                c: "no_matches"
            }, SPAN(f), d))
        }
    },
    _runQuery: function () {
        removeElement($("blank_state_project_editor"));
        actionPerfomed();
        this.current_form = null;
        var d = this.input.value;
        var c = window.User.is_premium;
        if (d == "") {
            return false
        }
        if (!c && (d.indexOf("&") != -1 || d.indexOf("|") != -1)) {
            return Agenda.showError(_("Boolean operators are only available for premium users."), $("editor"), true)
        }
        LocationManager.updateLocation("agenda/" + d);
        try {
            var h = TodoistFilterEngine.filter(d)
        } catch (f) {
            return Agenda.showError(f.toString())
        }
        var b = false;
        var g = DIV({
            id: "agenda_view"
        });
        map(h, function (i) {
            var j = true;
            if (i.is_filtered) {
                j = false
            }
            if (i.view == "flat_view") {
                RenderQueryLabelPriority.render(Agenda, g, i.items, i.name)
            } else {
                if (i.view == "day_view_span") {
                    DateItemRenderer.displayItems(g, i.items, null, false, j)
                } else {
                    if (i.view == "day_view_fixed") {
                        RenderQueryDays.render(Agenda, g, i.day_date, i.items, j)
                    } else {
                        if (i.view == "labels") {
                            if (c) {
                                LabelsExtended.renderLabels(g, LabelsModel.getAll(true))
                            } else {
                                Agenda.showError(_("Label manager is only available for premium users."), g, "premium")
                            }
                        } else {
                            if (i.view == "view_all") {
                                RenderQueryViewAll.render(Agenda, g, ProjectsModel.getAll());
                                b = true
                            } else {
                                if (i.view == "search") {
                                    RenderQuerySearch.render(Agenda, g, i)
                                }
                            }
                        }
                    }
                }
            }
        });
        this.cur_div = g;
        RCN($("editor"), g);
        var a = $gc($("editor"), "h2") || $gc($("editor"), "div", "premium_only");
        if (!b && !a && d.indexOf("q:") == -1) {
            Agenda.showError(SPAN(_("No tasks matches your query"), " `", B(this.input.value), "`."), g, "no_match")
        }
        Signals.sendSignal("rendered.queries");
        if (Agenda.flash_item) {
            AJS.fx.highlight($("item_" + Agenda.flash_item));
            Agenda.flash_item = null
        }
    },
    editCurrentItem: function (a) {
        this._editCurrentItem(AgendaEditMenu.current_holder);
        AgendaEditMenu.hide(null, true)
    },
    _editCurrentItem: function (c) {
        var a = $gp(getEventElm(c), "li");
        if (isClickAble(a)) {
            var b = $p(Agenda._initForm, a);
            if (Agenda.current_form) {
                Agenda._onSave(Agenda.current_form, b)
            } else {
                b()
            }
            return false
        }
    },
    _initForm: function (a) {
        var b = function () {
            showElement(a);
            Agenda.current_form = null;
            ItemEdit.genericCancelEdit();
            return false
        };
        var f = {
            cancel: ItemForms.genCancel("li", b, this),
            action: $p(Agenda._onSave),
            submit_val: _("Save"),
            submit_icon: "cmp_save",
            name_val: a.json.content,
            due_date: a.json.due_date,
            date_string: a.json.date_string,
            current_item: a,
            priority: a.json.priority
        };
        f.onKeyPress = function (i) {
            if (i.keyAscii == 13) {
                if (AmiComplete.shown()) {
                    return false
                }
                f.action(Agenda.current_form);
                return false
            }
            if (i.ctrl && i.keyAscii == 38) {
                var g = Agenda.getPElement(a);
                if (g) {
                    Agenda._onSave(Agenda.current_form, function () {
                        Agenda._initForm(g)
                    });
                    return false
                }
            }
            if (i.ctrl && i.keyAscii == 40) {
                var d = Agenda.getNElement(a);
                if (d) {
                    Agenda._onSave(Agenda.current_form, function () {
                        Agenda._initForm(d)
                    });
                    return false
                }
                return false
            } else {
                if (i.keyAscii == 9 && isSafari()) {
                    var h = $f(Agenda.current_form, "due_date");
                    if (h) {
                        var j = getEventElm(i);
                        if (j && !hasClass(j, "due_date")) {
                            preventDefault(i);
                            h.select()
                        }
                    }
                }
            }
        };
        f.no_indent = true;
        var c = ItemEdit.generateForm(f);
        Agenda.current_form = c.form;
        hideElement(a);
        insertAfter(c.li_item, a);
        c.textarea.resize();
        LibEdit.placeCursor(c.textarea, c.textarea.value.length);
        return false
    },
    _onSave: function (f, h) {
        var b = $gp(f, "li");
        var g = b.previousSibling;
        var d = update({}, g.json);
        var c = ItemEdit.genericSaveItem(g, f);
        if (!c) {
            return
        }
        var a = Agenda.renderItem(c.item, g.render_opts || null);
        swapDOM(g, a);
        map($bytc("li", "item_" + g.json.id), function (i) {
            if (i != a) {
                var j = Agenda.renderItem(c.item, g.render_opts || null);
                swapDOM(i, j)
            }
        });
        Agenda.refresh(d, c.item);
        if (c.is_updated) {
            AJS.fx.highlight(a);
            Agenda.updateCounters()
        }
        Agenda.current_form = null;
        if (isFunction(h)) {
            h()
        }
        return false
    },
    render: function () {
        var a = DIV({
            id: "agenda_box"
        });
        var b = FORM();
        b.onsubmit = this.showAgenda;
        ACN(a, b);
        ACN(b, this.input);
        var h = function (k, l) {
            if (!l) {
                l = k
            }
            var m = A({
                href: "#",
                "class": "action"
            }, k);
            AEV(m, "click", $p(Agenda.query, l));
            if (l.indexOf(_("today")) != -1) {
                m.id = "today_link"
            }
            return m
        };
        var j = TABLE({
            "class": "item_table"
        });
        var g = TBODY();
        ACN(j, g);
        var f = TD();
        ACN(g, TR(f));
        var d = AJS.A({
            href: "#",
            "class": "action help"
        }, "?");
        d.onclick = function () {
            return GB_show(_("Filter tasks..."), AJS.BASE_URL + "Help/timeQuery", 450, 480)
        };
        var i = A({
            href: "#",
            c: "action more icon",
            s: "padding-bottom: 2px",
            onclick: "return AgendaQueryMenu.toggle(this, this);"
        }, _("more"));
        if (isIe()) {
            i.onclick = function () {
                return AgendaQueryMenu.toggle(i, i)
            }
        }
        ACN(f, h(_("today"), "(" + AgendaTranslate.translate_to_lang("overdue") + ", " + _("today") + ")"), this.span_today_count = SPAN({
            c: "no_today_count"
        }), h(_("7 days"), "(" + AgendaTranslate.translate_to_lang("overdue, 7 days") + ")"));
        if (IsPremium) {
            var c = h(" @ ", "@");
            AmiTooltip.showSimpleText(c, _("Show all labels"));
            ACN(f, c)
        }
        ACN(f, i);
        ACN(b, j);
        this.li = LI(a);
        ACN($("agenda"), this.li)
    },
    renderItem: function (f, b) {
        var d;
        if (!d) {
            d = {
                fn_toggle_menu: this.toggleMenu,
                fn_complete_item: this.completeItem,
                fn_undo_complete_item: this.undoCompleteItem,
                with_project: true,
                with_time: true,
                no_indent: true
            }
        }
        if (b) {
            update(d, b)
        }
        var a = ItemsRender.renderItem(f, d);
        addClass(a, "agenda_item");
        addClass(a, "indent_1");
        a._collapsed = true;
        var c = true;
        if (b && b.not_editable) {
            c = false
        }
        if (c) {
            ItemForms.doubleClick(a.td_time, this._editCurrentItem);
            ItemForms.doubleClick(a.content, this._editCurrentItem)
        }
        return a
    },
    completeItem: function (a, c) {
        actionPerfomed();
        var d = false;
        if (c && c.shift) {
            d = true
        }
        var b = ItemsModel.complete(a.json.id, d);
        map(b, function (f) {
            var g = $("item_" + f.id);
            if (!g) {
                return
            }
            update(g.json, f);
            ItemCheckbox.update(g, 1, Agenda.undoCompleteItem, false)
        });
        Agenda.arrows.updateArrows();
        Agenda.updateCounters()
    },
    undoCompleteItem: function (a, c) {
        actionPerfomed();
        var b = ItemsModel.uncomplete(a.json.id);
        map(b, function (d) {
            var f = $("item_" + d.id);
            if (!f) {
                return
            }
            ItemCheckbox.update(f, 0, Agenda.completeItem);
            removeElement($bytc("span", "new_date", f));
            removeClass(f, "moved");
            setOpacity(f, 1)
        });
        Agenda.arrows.updateArrows();
        Agenda.updateCounters()
    },
    forceComplete: function () {
        Agenda.withCurrentItem(function (a) {
            Agenda.completeItem(a, {
                shift: true
            }, true)
        })
    },
    setCurrentItem: function () {
        if (AgendaEditMenu.current_holder) {
            this.current_item = AgendaEditMenu.current_holder;
            AgendaEditMenu.current_holder = null
        }
    },
    withCurrentItem: function (a) {
        return genericWithCurrentItem(this, this.menu_edit, a)
    },
    deleteCurrentItem: function (a) {
        return ItemCommonEdits.deleteCurrentItem(Agenda)
    },
    updatePriority: function (a) {
        this.withCurrentItem(function (c) {
            var b = c.json.priority;
            ItemCommonEdits.updatePriority(c, a);
            Agenda.refresh(c.json, {
                priority: b,
                due_date: c.json.due_date
            })
        })
    },
    toggleMenu: function (b, d, c, a) {
        if (b.disabled) {
            return false
        }
        ProjectEditorGeneric.onShowMenu(b, AgendaEditMenu);
        AgendaEditMenu.toggle(d, b, a);
        ProjectMenu.hide(null, true);
        return false
    },
    showMoveTo: function (a) {
        this.withCurrentItem(function (b) {
            ItemSelecter.toggle(b);
            ItemSelecter.moveItems($b(ItemSelecter.deselectAll, ItemSelecter))
        })
    },
    setTodayCount: function (d, c) {
        var b = d + c;
        var a = "today_count";
        if (c > 0) {
            a = "overdue_count"
        } else {
            if (d == 0) {
                a = "no_today_count"
            }
        }
        setClass(Agenda.span_today_count, a);
        setHTML(Agenda.span_today_count, "" + b)
    },
    updateCounters: function () {
        var b = function (c, d) {
            if (d == 0) {
                setHTML(c, " (" + d + ")")
            } else {
                setHTML(c, " <b>(" + d + ")</b>")
            }
        };
        var a = ItemsQueries.getCounts();
        Agenda.setTodayCount(a.today, a.overdue);
        b(PrioCount1, a.priority1);
        b(PrioCount2, a.priority2);
        b(PrioCount3, a.priority3);
        postMessageToWindow(top, "UPDATE_COUNT:" + serializeJSON(a));
        Signals.sendSignal("countsUpdated", a);
        setMacDockBadge(a.today + a.overdue)
    },
    getAllRenrededItems: function (c, b) {
        if (!b) {
            b = $bytc("li", "agenda_item")
        }
        var a = [];
        map(b, function (d) {
            if (isElementHidden(d) || hasClass(d, "moved")) {
                return
            }
            a.push(d)
        });
        return a
    },
    displayArrows: function (c, a) {
        var b = ItemsModel.getChildren(c, false);
        if (b.length > 0) {
            Agenda.arrows.displayArrow(a, true)
        }
    },
    genereateAgendaArrows: function () {
        this.arrows = new GenericArrows();
        this.arrows.list = this;
        this.arrows.getChildren = GenericManagerUtils.getChildren;
        this.arrows._hasChildren = function (a) {
            if (!a || !a.json) {
                return false
            }
            return ItemsModel.getChildren(a.json, false).length > 0
        };
        this.arrows._getArrows = function (a) {
            return $bytc("img", "arrow", a)
        };
        this.arrows._switchState = function (d, c) {
            var a = d.host_item;
            var b = ElementStore.get(a, "children");
            if (a.fetched && b) {
                if (a._collapsed) {
                    a._collapsed = false;
                    map(b, function (f) {
                        showElement(f)
                    })
                } else {
                    a._collapsed = true;
                    map(b, function (f) {
                        hideElement(f)
                    })
                }
            } else {
                a.fetched = true;
                a._collapsed = false;
                Agenda._fetchChildren(d)
            }
            removeElement($bytc("img", "arrow", a));
            Agenda.arrows.displayArrow(a);
            return false
        }
    },
    _fetchChildren: function (c) {
        var a = c.host_item;
        var f = {};
        if (a.render_opts) {
            update(f, a.render_opts)
        }
        f.no_indent = false;
        f.no_drag_and_drop = true;
        var d = a;
        var b = [];
        map(ItemsModel.getChildren(a.json), function (i) {
            var h = {};
            update(h, i);
            h.agenda_child_view = true;
            h.dont_show_arrow = true;
            h.collapsed = false;
            var g = Agenda.renderItem(h, f);
            removeClass(g, "indent_1");
            g.fetched = true;
            insertAfter(g, d);
            d = g;
            b.push(g)
        });
        ElementStore.set(a, "children", b);
        return false
    },
    getNElement: function (a) {
        var b = a.nextSibling;
        while (b) {
            if (!isElementHidden(b) && !hasClass(b, "manager")) {
                return b
            }
            b = b.nextSibling
        }
    },
    getPElement: function (a) {
        var b = a.previousSibling;
        while (b) {
            if (!isElementHidden(b) && !hasClass(b, "manager")) {
                return b
            }
            b = b.previousSibling
        }
    }
});
DateItemRenderer = {
    displayItems: function (j, a, c, g, f) {
        var h = [];
        for (var b = 0; b < a.length; b++) {
            var d = a[b];
            h.push(d);
            if (!this._isNextSameDate(a, d.due_date, b)) {
                if (!c || c(d)) {
                    if (g) {
                        h.reverse()
                    }
                    RenderQueryDays.render(Agenda, j, d.due_date, h, f)
                }
                h = []
            }
        }
    },
    _isNextSameDate: function (a, d, b) {
        var c = a[b + 1];
        if (c && c != "overdue_end") {
            return this.isSameDay(d, c.due_date)
        }
        return false
    },
    isSameDay: function (b, a) {
        if (!b || !a) {
            return false
        }
        return b.getDate() == a.getDate() && b.getMonth() == a.getMonth() && b.getYear() == a.getYear()
    }
};
var Labels = {
    re_labels: /(^|\s+)@([^\s,]+)/g,
    colors: ["#019412", "#a39d01", "#e73d02", "#e702a4", "#9902e7", "#1d02e7", "#0082c5", "#555555"],
    init: function () {
        if (window.IsPremium) {
            this.colors = this.colors.concat(["#008299", "#03b3b2", "#ac193d", "#82ba00", "#111111"])
        }
    },
    onLabel: function (a) {
        addClass(a, "label_on")
    },
    offLabel: function (a) {
        removeClass(a, "label_on")
    },
    getLabels: function (a) {
        var b = [];
        a = a.replace(Labels.re_labels, function (g, d, c) {
            c = c.toLowerCase();
            var f = LabelsModel.get(c);
            if (f) {
                b.push(f.id)
            } else {
                b.push(c)
            }
            return ""
        });
        return [a, b]
    },
    queryLabel: function (a) {
        Agenda.query("@" + a.innerHTML)
    },
    format: function (f, d) {
        if (!d.labels) {
            return f
        }
        var a = {};
        var g = [];
        var b = function (h) {
            if (!a[h.id]) {
                g.push(h);
                a[h.id] = true
            }
        };
        map(d.labels, function (i) {
            var h = LabelsModel.getById(i);
            if (h) {
                b(h);
                f = f.replace(new RegExp("(^|s)@" + h), "$1")
            }
        });
        var c = Labels.getLabels(f)[1];
        map(c, function (h) {
            h = LabelsModel.getById(h);
            if (h) {
                b(h);
                f = f.replace(new RegExp("(^|s)@" + h), "$1")
            }
        });
        return Labels._format(f, g)
    },
    _format: function (c, d) {
        if (!d || d.length == 0) {
            return c
        }
        var a = [];
        var b = 0;
        map(d, function (h, j) {
            if (h) {
                var f = 'style="color: ' + (Labels.colors[h.color] || "#555555") + '"';
                var g = 'onmouseover="Labels.onLabel(this)" onmouseout="Labels.offLabel(this)"';
                a.push('<div class="label" onclick="Labels.queryLabel(this)" ' + f + " " + g + ">" + h.name + "</div>");
                b++;
                c = c.replace(new RegExp("(^|s)@" + h, "ig"), "")
            }
            var k = d[j + 1];
            if (k) {
                a.push('<div class="label label_sep">,</div>')
            }
        });
        if (b > 0) {
            a.push('<div class="label label_sep"> </div>')
        }
        var d = a.join("");
        return c + '<div class="labels_holder">' + d + "</div>"
    },
    formatByContent: function (c) {
        var b = Labels.getLabels(c);
        c = b[0];
        var d = b[1];
        if (d.length == 0) {
            return c
        } else {
            var a = [];
            map(d, function (f) {
                var g;
                if (isNumber(f)) {
                    g = LabelsModel.getById(f)
                } else {
                    g = {
                        name: f,
                        color: 0
                    }
                } if (g) {
                    a.push(g)
                }
            });
            return Labels._format(c, a)
        }
    },
    jsonFormat: function (a) {
        a = a.replace(Labels.re_labels, function (d, c, b) {
            var f = function (g) {
                return "\\" + g
            };
            b = b.replace(/\*|\+/g, f);
            return d.replace(new RegExp(c + "@" + b, "g"), "")
        });
        return strip(a)
    },
    textFormat: function (c, d) {
        var b = {};
        var a = [];
        if (d) {
            map(d, function (i) {
                var g = LabelsModel.getById(i);
                if (g && !b[g.id]) {
                    var f = "@" + g.name;
                    var h = new RegExp("(^|s)@" + AmiComplete.escapeReqExpSepcails(g.name), "ig");
                    if (c.match(h) == null) {
                        a.push(f);
                        b[g.id] = true
                    }
                }
            })
        }
        a = a.join(" ");
        if (a.length > 0) {
            a += " "
        }
        return a + strip(c)
    }
};
var GUploads, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GUploads = (function () {
    function a() {
        this.fileUploaded = __bind(this.fileUploaded, this);
        this.allFilesUploaded = __bind(this.allFilesUploaded, this);
        this.showUpload = __bind(this.showUpload, this)
    }
    a.prototype.showUpload = function (c, b) {
        var f, d, g;
        if (b == null) {
            b = 1
        }
        Uploads.current_textarea = c;
        b = b === true && 1 || 0;
        d = "/Uploader/showAttachFile?multiple=" + b;
        f = window.old_GB_show || GB_show;
        g = f(_("Upload files, documents or images"), d, 275, 310);
        GB_getLast().setZindex(10000000);
        return g
    };
    a.prototype.allFilesUploaded = function () {
        var b;
        b = Uploads.current_textarea;
        b.value = b.value.replace(/\n\n\n+/g, "\n\n");
        b.value = strip(b.value);
        Uploads.current_textarea = null;
        return top.GB_hide()
    };
    a.prototype.fileUploaded = function (f, d, c) {
        var g, b;
        b = Uploads.current_textarea;
        if (b) {
            g = "\n\n" + f;
            d = d.replace("(", "[");
            d = d.replace(")", "]");
            g += " (" + d + ")";
            g += "\n";
            return LibEdit.insertAtCursor(b, g)
        }
    };
    return a
})();
window.Uploads = new GUploads();
Notes = {
    current_task: null,
    current_project: null,
    init: function () {
        AEV(window, "load", function () {
            TemporaryIds.listenAll(function (b, a) {
                var c = $("note_" + b);
                if (c) {
                    c.id = "note_" + a
                }
            })
        })
    },
    annotate: function (b, d, c) {
        if (window.NATIVE_APP == "mac_store" && !window.IsPremium) {
            return false
        }
        var a = Notes._renderIcon(b, c);
        ACN(d, a)
    },
    _renderIcon: function (d, f) {
        var a = imageSprite("cmp_note clickable", 15, 14);
        var c = SPAN({
            c: "clickable note_icon"
        }, a);
        AEV(c, "click", $p(Notes.loadAndShow, d.task_id || d.id));
        AEV(c, "mouseover", function () {
            setClass(a, "cmp_note_on clickable")
        });
        AEV(c, "mouseout", function () {
            setClass(a, "cmp_note clickable")
        });
        if (d.notes) {
            map(d.notes, function (g) {
                NotesModel.notes_model[g.id] = g
            })
        }
        var b = NotesModel.getNotes(d.task_id || d.id);
        if (b.length > 0) {
            ACN(c, SPAN({
                c: "clickable note_count"
            }, "" + b.length))
        } else {
            AEV(f, "mouseover", function () {
                setVisibility(c, true)
            });
            AEV(f, "mouseout", function () {
                setVisibility(c, false)
            });
            setVisibility(c, false)
        }
        return c
    },
    loadAndShow: function (b, f) {
        if (f && (f.ctrl || f.shift)) {
            return false
        }
        if (IsPremium) {
            var c = DIV({
                c: "notes_holder notes_loading"
            }, Indicator.imgMedium())
        } else {
            var c = Notes.renderHolderPromotion()
        }
        var g = Notes.getDimension();
        GB_showHTML(_("Notes"), c, g.height, g.width, {
            close_validator_fn: function () {
                setEditOff();
                var i = $gc(c, "textarea");
                if (!i) {
                    return true
                }
                var j = strip(i.value);
                if (j.length != 0) {
                    var k = confirm(_("Are you sure you want to cancel your current note?"));
                    if (!k) {
                        i.focus();
                        return false
                    }
                }
                return true
            }
        });
        b = TemporaryIds.getRealId(b);
        var d = ItemsModel.getById(b);
        if (d) {
            Notes.renderItemAndNotes(c, d)
        } else {
            var h = function (i) {
                if (i.item == null) {
                    GB_hide();
                    alert(_("The task was not found, could be deleted."));
                    return
                }
                ItemsModel.model_data[i.item.id] = i.item;
                ProjectsModel.model_data[i.project.id] = i.project;
                map(i.notes, function (j) {
                    NotesModel.notes_model[j.id] = j
                });
                ItemsModel.clearCache();
                NotesModel.clearCache();
                Notes.renderItemAndNotes(c, i.item)
            };
            var a = function () {
                alert(_("An unknown error happened") + ". " + _("Please try again later. We're sorry for the trouble."));
                GB_hide()
            };
            NotesModel.ajaxGetNotesData(b, h, a)
        }
        return false
    },
    renderItemAndNotes: function (c, f, d) {
        var b = NotesModel.getNotes(f.id);
        if (b.length > 0 || window.IsPremium) {
            Notes.current_task = f;
            Notes.current_project = ProjectsModel.get(f.project_id);
            var g = Notes.renderHolder(f);
            swapDOM(c, g);
            Notes.getNotes(f, Notes.div_notes);
            var a = $gc(g, "textarea");
            a.focus();
            Notes.attachNoteKeyboardShortcuts(a)
        }
        return false
    },
    renderHolderPromotion: function () {
        var b = _("<a>Upgrade to Todoist Premium for instant access</a> to this and a lot of other features").replace("<a>", '<a href="/PremiumLanding/show" onclick="return top.WindowOpener.showPrefs(\'premium\');">');
        if (window.IS_MINI) {
            b = b.replace("</a>", "</a><br>")
        }
        var a = DIV({
            c: "notes_holder"
        }, DIV({
            c: "premium_only"
        }, DIV({
            c: "p_header"
        }, _("Notes and file attachments are premium features")), DIV({
            c: "text"
        }, setHTML(SPAN(), b))));
        return a
    },
    renderHolder: function (j) {
        var h, a, b, c;
        var a = AmiButton.createButton(_("Add Note"), null, "red");
        var d = AmiButton.createMiniButton(imageSprite("cmp_attach_file", 16, 16), "upload_btn");
        AmiTooltip.showSimpleText(d, _("Attach files, documents or images"));
        var i = Notes.renderExtraInfo(j);
        var g = DIV({
            c: "notes_holder"
        }, DIV({
            c: "note_item"
        }, UL({
            c: "items"
        }, Notes.renderItem(j)), i), this.div_notes = c = DIV({
            c: "note_notes",
            id: "current_notes"
        }), DIV({
            c: "note_submit"
        }, b = FORM(h = TEXTAREA(), DIV({
            c: "btn_area"
        }, a, d))));
        ACN(c, IMG({
            src: "https://d3ptyyxy2at9ui.cloudfront.net/fb947b5107ee9a4cbb1a7299459d46ae.gif"
        }));
        var f = $p(Notes.addNote, j, b);
        b.submit_fn = f;
        AEV(b, "submit", f);
        AEV(a, "click", f);
        AEV(d, "click", $p(Uploads.showUpload, h, true));
        new ResizingTextArea(null, h, false);
        return g
    },
    renderExtraInfo: function (f) {
        if (!f.date_added) {
            return null
        }
        var d = DIV({
            c: "note_extra_info"
        });
        if (f.date_added) {
            Notes.resolveDate(f, "date_added");
            var g = this.current_project;
            if (g && g.shared) {
                var a = A({
                    href: "#project/" + g.id
                }, g.name);
                AEV(a, "click", function () {
                    GB_hide();
                    ProjectList.setCurrentById(g.id, f.id);
                    return false
                });
                ACN(d, a, SPAN({
                    c: "sep"
                }, " • "));
                var b = Collaborators.getUserById(f.assigned_by_uid);
                if (b) {
                    var h = SPAN(_("Added by"), " ", Notes.shortName(b));
                    ACN(d, h, SPAN({
                        c: "sep"
                    }, " • "))
                }
            }
            var c = SPAN(Notes.formatDate(f.date_added));
            AmiTooltip.showSimpleText(c, _("Time added"));
            ACN(d, c)
        }
        return d
    },
    renderItem: function (a) {
        var b = Agenda.renderItem(a, {
            with_due_date: true,
            no_drag_and_drop: true,
            with_project: false,
            not_editable: true,
            fn_complete_item: this.completeItem,
            fn_undo_complete_item: this.undoCompleteItem
        });
        return b
    },
    completeItem: function (a, c) {
        var b = ItemsModel.complete(a.json.id);
        ItemCheckbox.update(a, 1, Notes.undoCompleteItem, false);
        var d = ProjectsModel.get(a.json.project_id);
        if (d) {
            refreshInterface([d])
        }
    },
    undoCompleteItem: function (a, c) {
        var b = ItemsModel.uncomplete(a.json.id);
        ItemCheckbox.update(a, 0, Notes.completeItem);
        var d = ProjectsModel.get(a.json.project_id);
        if (d) {
            refreshInterface([d])
        }
    },
    renderNote: function (g) {
        var b = this.current_project && this.current_project.shared;
        var f = Formatter.format(g.content);
        var c = imageSprite("cmp_trash", 10, 11);
        var i = imageSprite("cmp_pencil", 16, 16);
        Notes.resolveDate(g, "posted");
        var j = Notes.formatDate(g.posted);
        if (!g.posted_uid) {
            g.posted_uid = window.User.id
        }
        var l = null;
        if (g.posted_uid == window.User.id) {
            var l = DIV({
                c: "note_actions"
            }, i, " ", c, " ")
        }
        var k = DIV({
            c: "note_meta"
        }, j, l);
        var a = DIV({
            c: "note_text",
            id: "note_" + g.id
        }, k, setHTML(SPAN({
            c: "note_content"
        }), f));
        if (b) {
            var d = Collaborators.getUserById(g.posted_uid);
            if (d) {
                var h = Avatars.renderAvatar(d, "medium");
                addClass(a, "has_avatar");
                ATT(a, h);
                ATT(k, SPAN({
                    c: "user_name"
                }, Notes.shortName(d)))
            }
        }
        AEV(c, "click", $p(Notes.deleteNote, g, a));
        AEV(i, "click", $p(Notes.showEditNote, g, a));
        return a
    },
    clearEmpty: function () {
        removeElement($bytc("div", "no_notes", $("current_notes")))
    },
    focusLatest: function (a) {
        $("current_notes").scrollTop = a.offsetTop
    },
    showEditNote: function (d, c) {
        Notes.current_note = d;
        var g = Notes.getDimension();
        var b, a;
        a = AmiButton.createButton(_("Update note"), null, "red");
        var f;
        var c = DIV({
            c: "note_submit"
        }, f = FORM(b = TEXTAREA(), DIV({
            c: "btn_area"
        }, a)));
        var h = $p(Notes.saveNote, a, d, b);
        f.submit_fn = h;
        AEV(a, "click", h);
        new ResizingTextArea(null, b, false);
        b.value = d.content;
        Notes.attachNoteKeyboardShortcuts(b);
        GB_showHTML(_("Edit note"), c, g.height, g.width);
        $gc(c, "textarea").focus();
        return false
    },
    saveNote: function (b, c, a) {
        hideElement(b);
        insertAfter(IMG({
            src: "https://d3ptyyxy2at9ui.cloudfront.net/fb947b5107ee9a4cbb1a7299459d46ae.gif",
            c: "indicator"
        }), b);
        NotesModel.updateNote(Notes.current_note.id, Notes.current_note.item_id, a.value);
        var f;
        var d = Notes.current_note;
        d.content = a.value;
        GB_hide();
        swapDOM($("note_" + d.id), f = Notes.renderNote(d));
        AJS.fx.highlight(f);
        return false
    },
    getNotes: function (f, c) {
        var g = function (h) {
            RCN(c, null);
            if (h.length == 0) {
                ACN(c, DIV({
                    c: "no_notes"
                }, _("This task has no notes")))
            } else {
                var i;
                map(h, function (j) {
                    ACN(c, i = Notes.renderNote(j))
                });
                if (i) {
                    Notes.focusLatest(i)
                }
            }
        };
        var a = f.task_id || f.id;
        var b = ItemsModel.getById(a);
        if (b) {
            g(NotesModel.getNotes(a))
        } else {
            var d = loadJSON("/Notes/getAll");
            d.addCallback(g);
            d.sendReq({
                item_id: a
            })
        }
    },
    addNote: function (f, d) {
        var a = $gc(d, "textarea");
        var g = strip(a.value);
        if (g.length == 0) {
            return false
        }
        var b = NotesModel.addNote(f.task_id || f.id, a.value);
        a.value = "";
        a.focus();
        Notes.clearEmpty();
        var c = Notes.renderNote(b);
        ACN($("current_notes"), c);
        Notes.focusLatest(c);
        AJS.fx.highlight(c);
        Notes.updateCount();
        return false
    },
    deleteNote: function (b, a) {
        Alerts.confirm(_("Are you sure you want to delete this note?"), function (c) {
            if (c) {
                NotesModel.deleteNote(b.item_id, b.task_id || b.id);
                removeElement(a);
                Notes.updateCount()
            }
        })
    },
    updateCount: function (d) {
        var c = Notes.current_task;
        var b = $("item_" + (c.task_id || c.id));
        var a = $gc(b, "span", "note_icon");
        if (a) {
            swapDOM(a, Notes._renderIcon(c, b))
        }
    },
    getDimension: function () {
        var b = 600,
            a = 600;
        if (window.IS_MINI) {
            b = 300;
            a = 200
        }
        return {
            width: b,
            height: a
        }
    },
    formatDate: function (a) {
        var b = DateController.formatDate(a) + " - " + DateController.getHourAndMin(a, Settings.AMPM);
        return b
    },
    resolveDate: function (b, a) {
        if (!b[a]) {
            return null
        }
        if (b.ntime) {
            b[a] = new Date(b.ntime)
        } else {
            if (isString(b[a])) {
                b[a] = new Date(b[a])
            } else {
                b.ntime = b[a].getTime()
            }
        }
    },
    attachNoteKeyboardShortcuts: function (a) {
        AEV(a, "keydown", function (d) {
            if (d.ctrl && d.key == 13) {
                var c = $gp(a, "form");
                c.submit_fn();
                preventDefault(d);
                return false
            }
            var b = resolveFormatShortcuts(a, d);
            if (b) {
                return false
            }
        })
    },
    shortName: function (a) {
        var b = a.full_name.split(" ");
        if (b.length > 1) {
            return b[0] + " " + b[1].substring(0, 1) + "."
        } else {
            return b[0]
        }
    }
};

function disableForm(a) {
    map($bytc("*", null, a), function (b) {
        b.disabled = true;
        b._disabled = true
    })
}

function enableForm(a) {
    map($bytc("*", null, a), function (b) {
        if (b._disabled) {
            b.disabled = false
        }
    })
}
Notes.init();
GProjectList = GenericManager.extend({
    init: function () {
        var c = {
            data_model: ProjectsModel,
            max_indent: 4,
            arrows: new GenericArrows({
                data_model: ProjectsModel,
                x_off: -6
            })
        };
        c.arrows.setList(this);
        var a = c.arrows._switchState;
        var b = function (f, d) {
            a(f, d);
            Signals.sendSignal("update_project_count", f.host_item.json)
        };
        c.arrows._switchState = b;
        this.parent(c);
        this.current_list = null;
        this.current_item = null;
        this.current_selected = null;
        this.current_m_holder = null;
        this.empty_text = _("You have no projects");
        this.move_x = false;
        bindMethods(this);
        this.menu = generateProjectListMenu(this);
        this.menu_colors = generateMenuProjectColors(this);
        TemporaryIds.listenAll(function (f, d) {
            var g = $("project_" + f);
            if (g) {
                g.id = "project_" + d
            }
        })
    },
    insertItems: function (b) {
        var a = this;
        var d = a.current_list;
        var c = a.current_selected && a.current_selected.json.id;
        RCN(d, null);
        a.current_selected = null;
        map(b, function (h, g) {
            var f = ProjectList.renderItem(h);
            ACN(d, f);
            if (c == h.id) {
                a.current_selected = f
            }
        });
        if (a.current_selected) {
            addClass(a.current_selected, "current")
        }
        GenericManagerUtils.showChildren($FA(d.childNodes));
        this.arrows.updateArrows();
        this.checkEmpty()
    },
    renderEmpty: function () {
        if (User.inbox_project) {
            return null
        } else {
            return this.parent()
        }
    },
    checkEmpty: function () {
        var a = this.parent();
        var b = $("blank_state_project_list");
        if (ItemsModel.getAll().length > 0) {
            a = false
        }
        if (a && !b && !hasClass(getBody(), "full_width")) {
            removeElement($("blank_state_project_editor"));
            var c = DIV({
                id: "blank_state_project_list"
            }, IMG({
                src: "https://d3ptyyxy2at9ui.cloudfront.net/59e72a9d92913597fc32b44e7b8e4430.png"
            }), DIV({
                c: "blank_state_text"
            }, B(_("Add your first project now")), DIV(_("Keep track of where tasks belong.")), DIV(_("Start adding your projects!"))));
            AJS.fx.fadeIn(c);
            ACN(getBody(), c)
        } else {
            if (!a && b) {
                removeElement(b)
            }
        }
        PremiumPromotion.checkEmpty()
    },
    getProjectById: function (b) {
        var a = null;
        map($FA(this.current_list.childNodes), function (c) {
            if (c.json && c.json.id == b) {
                a = c;
                return true
            }
        });
        return a
    },
    deselectCurrent: function () {
        removeClass($bytc("li", null, this.current_list), "current")
    },
    setCurrentById: function (f, a, d, b) {
        this.flash_item = a;
        var c = false;
        AJS.map(AJS.$FA(ProjectList.current_list.childNodes), function (g) {
            if (g.json && g.json.id == f) {
                ProjectList.setCurrent(g, d, b);
                c = true;
                return true
            }
        });
        if (!c) {
            ProjectEditorManager.showProjects([f], d)
        }
        return false
    },
    setCurrent: function (c, f, b) {
        this.deselectCurrent();
        GenericManagerUtils.openParents(c);
        addClass(c, "current");
        this.current_selected = c;
        document.title = c.json.name.replace(/^\*\s*/, "") + ": Todoist";
        var d;
        if (b != false) {
            d = [];
            var a = GenericManagerUtils.getChildren(this.current_selected, true);
            map(a, function (g) {
                d.push(g.json.id);
                addClass(g, "current")
            })
        } else {
            d = [c.json.id]
        }
        ProjectEditorManager.showProjects(d, f);
        ProjectList.arrows.updateArrows();
        if (window.Mini) {
            window.Mini.hideController()
        }
        Signals.sendSignal("hide_all_menus")
    },
    editingDone: function (a) {
        if (a) {
            this.current_item = a
        }
        this.current_form = null;
        this.current_cancel = null;
        this.arrows.updateArrows();
        this.checkEmpty()
    },
    refreshCurrent: function () {
        var a = ProjectList.current_selected;
        if (a) {
            ProjectList.setCurrent(a)
        }
    },
    saveItem: function (a, k) {
        var j = getParentBytc(a, "li");
        var i = j.list_item;
        var d = $f(a, "ta").value;
        var c = GenericManagerUtils.getIndent(j);
        var g = this.selected_color;
        var f = false;
        if (d != i.json.name || c != i.json.indent) {
            f = true
        }
        if (g != null && g != i.json.color) {
            f = true
        }
        if (f) {
            this.alterChildIndent(i, c);
            var h = {
                name: d,
                indent: c
            };
            if (g != null) {
                h.color = g
            }
            var l = ProjectsModel.update(i.json.id, h);
            var b = ProjectList.renderItem(l);
            if (hasClass(i, "current")) {
                addClass(b, "current");
                ProjectList.current_selected = b
            }
            swapDOM(i, b);
            GenericManagerUtils.setIndent(b, c);
            removeElement(j);
            ProjectList.editingDone(b);
            if (isFunction(k)) {
                k()
            }
        } else {
            this.cancelCurrentEdit();
            if (isFunction(k)) {
                k()
            }
        }
        return false
    },
    editCurrentItem: function () {
        this.parent();
        var c = function () {
            showElement(ProjectList.current_item);
            ProjectList.arrows.updateArrows()
        };
        var h = {
            cancel: ItemForms.genCancel("li", c, this),
            action: ProjectList.saveItem,
            submit_val: _("Save"),
            submit_icon: "cmp_save",
            name_val: this.current_item.json.name,
            indent_arrows: true
        };
        this.current_cancel = h.cancel;
        var g = this.generateAddEditForm(h);
        this.selected_color = null;
        var b = this.createColorSelector(this.current_item.json.color);
        ATT(g.text_box_holder, b);
        var f = g.li_item;
        var a = g.textarea;
        f.list_item = this.current_item;
        this.current_form = g.form;
        GenericManagerUtils.setIndent(f, this.current_item.json.indent);
        insertAfter(f, this.current_item);
        a.resize();
        LibEdit.placeCursor(a, a.value.length)
    },
    deleteCurrentItem: function () {
        var a = this;
        actionPerfomed();
        a.withCurrentItem(function (h) {
            var d = GenericManagerUtils.getChildren(h, false);
            var c = [];
            var b = null;
            if (d && d.length > 0) {
                var f = [];
                map(d, function (j) {
                    var i = j.json && j.json.name;
                    if (i) {
                        f.push(i);
                        c.push(j.json.id)
                    }
                });
                b = SPAN(BR(), BR(), setHTML(SPAN(), _("Child project(s) %s will be deleted as well.").replace("%s", "<b>" + f.join(", ") + "</b>")))
            }
            var g = SPAN(setHTML(SPAN(), _("Are you sure you want to delete %s?").replace("%s", "<b>" + a.current_item.json.name + "</b>")), b);
            Alerts.confirm(g, function (i) {
                if (i) {
                    d.splice(0, 0, h);
                    c.splice(0, 0, h.json.id);
                    map(d, function (j) {
                        Signals.sendSignal("project_deleted", j)
                    });
                    ProjectsModel.deleteProjects(c);
                    ProjectList.editingDone();
                    Agenda.updateCounters()
                }
            })
        })
    },
    projectDeleted: Signals.connect("project_deleted", function (a) {
        if (a == ProjectList.current_selected) {
            ProjectEditorManager.reset();
            $("editor").innerHTML = "";
            ProjectList.current_selected = null
        }
        removeElement(a)
    }),
    addItem: function (a, i) {
        var k = this;
        var f = getParentBytc(a, "li");
        var h = f.previousSibling;
        var b = 1;
        if (h) {
            b = h.json.item_order + 1
        }
        var g = $bytc("li", null, this.current_list);
        map(g, function (l) {
            if (l.json) {
                if (l.json.item_order >= b) {
                    l.json.item_order += 1
                }
            }
        });
        var c = a.color || 1;
        if (k.selected_color != null) {
            c = k.selected_color
        }
        var d = {
            name: $f(a, "ta").value,
            item_order: b,
            indent: GenericManagerUtils.getIndent(f),
            color: c
        };
        if (d.name != "") {
            var j = ProjectsModel.add(d);
            if (!j) {
                return
            }
            f.json = j;
            ProjectList.saveOrder(function () {
                var l = ProjectList.renderItem(j);
                swapDOM(f, l);
                ProjectList.setCurrent(l);
                ProjectList.editingDone(l);
                if (isFunction(i)) {
                    i()
                }
                Agenda.updateCounters()
            })
        } else {
            this.current_item = f;
            if (isFunction(i)) {
                i()
            }
        }
        return false
    },
    showAddItem: function (g, h, l) {
        removeElement($("blank_state_project_list"));
        this.parent(g, h, l);
        var k = function () {
            ProjectList.checkEmpty();
            ProjectList.arrows.updateArrows()
        };
        var c = 7;
        if (g == true && this.current_item) {
            c = this.current_item.json.color
        }
        var j = {
            cancel: ItemForms.genCancel("li", k, this),
            action: ProjectList.addItem,
            submit_val: _("Add project"),
            submit_icon: "cmp_add",
            name_val: "",
            indent_arrows: true
        };
        this.current_cancel = j.cancel;
        var i = this.generateAddEditForm(j);
        var f = this.createColorSelector(c);
        ATT(i.text_box_holder, f);
        var a = this.current_form = i.form;
        a.color = c;
        if (g == true) {
            var b = GenericManagerUtils.getIndent(this.current_item) || 1;
            GenericManagerUtils.setIndent(i.li_item, b)
        }
        this.insertForm(i.li_item, h);
        setTimeout(function () {
            i.textarea.focus()
        }, 20)
    },
    render: function () {
        var a = DIV({
            id: "project_man"
        });
        addClass(a, "actions");
        var b = A({
            href: "",
            "class": "action"
        }, _("Add project"));
        this.add_item = b;
        b.onclick = function () {
            ProjectList.saveCurrentItem(function () {
                ProjectList.current_item = ProjectList.getItem(getLast);
                ProjectList.showAddItem()
            });
            return false
        };
        ACN(a, b);
        ACN($("project_list_man"), a)
    },
    renderItem: function (n, i) {
        var c = GenericManagerUtils.getMenuEditIcon();
        var o = TABLE({
            cellpadding: 0,
            cellspacing: 0,
            "class": "item_table"
        });
        var f = TBODY();
        ACN(o, f);
        var g = LI({
            "class": "clickable"
        }, o);
        g.json = n;
        ATT(g, DIV({
            c: "invisible_space"
        }));
        new MenuRightClick(g, $p(this.toggleMenu, g, {
            id: n.id
        }, n.id));
        if (i != true && !n.inbox_project) {
            DragAndDrop.attach(g)
        }
        var a = TD({
            "class": "name"
        });
        var m = n.name;
        var l = m.match(/[^ ]{20}.+?/g);
        if (l) {
            map(l, function (p) {
                m = m.replace(p, p.substr(0, 20) + "... ")
            })
        }
        setHTML(a, Formatter.format(m, true));
        var j = TD({
            "class": "menu"
        }, c);
        c.onclick = function (p) {
            ProjectList.toggleMenu(g, c, n.id)
        };
        g.menu_icon = c;
        GenericManagerUtils.attachMenuIconListeners(g);
        var k = TD({
            "class": "td_color"
        }, ProjectItemCounter.createColor(n));
        ACN(a, ProjectItemCounter.createCounter(n));
        var d = DIV({
            "class": "td_separator"
        });
        if (!isIe()) {
            d.style.width = "2px"
        }
        var b = TD(d);
        var h = function (q) {
            var r = getEventElm(q);
            if (!r.is_menu_icon && nodeName(r) != "img") {
                if (q.shift || q.ctrl) {
                    preventDefault(q);
                    if (!ProjectEditorManager.current_editor) {
                        ProjectList.setCurrent(g)
                    } else {
                        var p = ProjectEditorManager.toggleProject(n.id);
                        if (p) {
                            addClass(g, "current")
                        } else {
                            removeClass(g, "current")
                        }
                    }
                    return false
                } else {
                    ProjectList.setCurrent(g);
                    window.scroll(0, 0)
                }
            }
        };
        AEV(g, "click", h);
        ACN(f, TR(k, b, a, j));
        GenericManagerUtils.setIndent(g, n.indent, true);
        return g
    },
    setColor: function (b, c) {
        var a = this;
        actionPerfomed();
        this.withCurrentItem(function (d) {
            if (d.json.color != b && c) {
                d.json.color = b;
                ProjectsModel.update(d.json.id, {
                    color: b
                });
                addClass(c, "selected_color");
                ProjectList._resetColors(c)
            } else {
                d.json.color = b
            }
            Signals.sendSignal("update_project_color", d.json)
        })
    },
    _resetColors: function (a) {
        map($FA(a.parentNode.childNodes), function (b) {
            removeClass(b, "selected_color");
            removeClass(b, "hovering")
        })
    },
    onShowMenu: function (c) {
        selectColor(this.menu, c.json.color);
        if (c.json.inbox_project) {
            hideElement($bytc("tr", "project_inbox_action", this.menu.menu_holder));
            return
        } else {
            showElement($bytc("tr", "project_inbox_action", this.menu.menu_holder))
        }
        var a = $("menu_archive_text");
        var b = c.json.is_archived;
        if (b) {
            setHTML(a, _("Unarchive"));
            hideElement(this.menu.colors.view);
            hideElement($bytc("tr", "project_archive_action", this.menu.menu_holder))
        } else {
            setHTML(a, _("Archive"));
            showElement(this.menu.colors.view);
            showElement($bytc("tr", "project_archive_action", this.menu.menu_holder))
        }
    },
    toggleMenu: function (b, d, c, a) {
        this.onShowMenu(b);
        Signals.sendSignal("hide_all_menus");
        this.menu.toggle(d, b, a);
        return false
    },
    colorSelected: Signals.connect("project_color_selected", function (a) {
        var d = $("project_color_selector");
        if (d) {
            ProjectList.selected_color = a;
            var c = ProjectList.createColorSelector(a);
            swapDOM(d, c);
            var b = $gc($("project_list"), "textarea");
            b.focus()
        }
    }),
    createColorSelector: function (c) {
        var b = this;
        var a = ProjectItemCounter.createColor({
            color: c
        });
        a.id = "project_color_selector";
        addClass([a, $gc(a, "div")], "menu_icon");
        AEV(a, "click", function () {
            b.menu_colors.show(a, true);
            return false
        });
        selectColor(this.menu_colors, c);
        return a
    },
    getAllRenrededItems: function (d, c) {
        if (c == undefined) {
            c = true
        }
        var a = this.parent(d);
        var b = [];
        map(a, function (f) {
            if (c == true && f.json && f.json.inbox_project) {
                return
            } else {
                b.push(f)
            }
        });
        return b
    },
    isEmpty: function () {
        var a = 0;
        if (User.inbox_project) {
            a = 1
        }
        return this.getAllRenrededItems(false, false).length == a
    }
});
var initProjectColors;
window.ProjectColors = ["#95ef63", "#ff8581", "#ffc471", "#f9ec75", "#a8c8e4", "#d2b8a3", "#e2a8e4", "#dddddd", "#fb886e", "#ffcc00", "#74e8d3", "#3bd5fb"];
initProjectColors = function () {
    if (window.IsPremium) {
        return window.ProjectColors = window.ProjectColors.concat(["#dc4fad", "#ac193d", "#d24726", "#82ba00", "#03b3b2", "#008299", "#5db2ff", "#0072c6", "#000000", "#777777"])
    }
};
var GProjectItemCounter, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GProjectItemCounter = (function () {
    function a() {
        this._setCountColor = __bind(this._setCountColor, this);
        this.createColor = __bind(this.createColor, this);
        this.createCounter = __bind(this.createCounter, this);
        this.updateColor = __bind(this.updateColor, this);
        this.updateCount = __bind(this.updateCount, this);
        AEV(window, "load", function () {
            return TemporaryIds.listenAll(function (c, b) {
                var d;
                d = $("project_count_" + c);
                if (d) {
                    d.id = "project_count_" + b
                }
                d = $("project_color_" + c);
                if (d) {
                    return d.id = "project_color_" + b
                }
            })
        });
        Signals.connect("update_project_count", this.updateCount);
        Signals.connect("update_project_color", this.updateColor)
    }
    a.prototype.updateCount = function (b) {
        var c;
        c = $("project_count_" + b.id);
        if (c) {
            return swapDOM(c, this.createCounter(b))
        }
    };
    a.prototype.updateColor = function (b) {
        var c;
        c = $("project_color_" + b.id);
        if (c) {
            return swapDOM(c, this.createColor(b))
        }
    };
    a.prototype.createCounter = function (h) {
        var i, d, c, g, b, f;
        d = h.cache_count;
        if (h.collapsed) {
            f = ProjectsModel.getChildren(h);
            for (g = 0, b = f.length; g < b; g++) {
                i = f[g];
                d += i.cache_count
            }
        }
        if (d === 0) {
            d = ""
        }
        c = DIV({
            c: "counter_count",
            id: "project_count_" + h.id
        }, "" + d);
        return c
    };
    a.prototype.createColor = function (d, c) {
        var f, b;
        if (c == null) {
            c = true
        }
        if (c === void 0) {
            c = true
        }
        if (c && d.inbox_project) {
            return DIV(imageSprite("cmp_inbox", 16, 16))
        } else {
            f = DIV({
                "class": "div_color",
                id: "project_color_" + d.id
            }, b = DIV({
                c: "counter_color"
            }, ""));
            this._setCountColor(b, d.color);
            return f
        }
    };
    a.prototype._setCountColor = function (b, c) {
        var d;
        d = ProjectColors[c] || "#dddddd";
        setStyle(b, "color", d);
        return setStyle(b, "backgroundColor", d)
    };
    return a
})();
window.ProjectItemCounter = new GProjectItemCounter();
var GProjectsArchive, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GProjectsArchive = (function () {
    function a() {
        this._doRequest = __bind(this._doRequest, this);
        this.unarchive = __bind(this.unarchive, this);
        this.archive = __bind(this.archive, this);
        this.toggleArchive = __bind(this.toggleArchive, this);
        this.getArchived = __bind(this.getArchived, this);
        this.render = __bind(this.render, this)
    }
    a.prototype.render = function (b) {
        var c;
        if (window.IsPremium) {
            ACN($("project_list_man"), DIV({
                c: "controller actions his_ctrl",
                id: "projects_archived_holder"
            }, UL({
                id: "projects_archived_ul",
                c: "items"
            }), c = A({
                href: "#"
            }, _("Show archived projects"))));
            return AEV(c, "click", this.getArchived)
        }
    };
    a.prototype.getArchived = function (c) {
        var b, f, d;
        b = $("projects_archived_holder");
        f = $("projects_archived_ul");
        Indicator.addToElm(b.parentNode);
        d = loadJSONDoc("/Projects/getArchived");
        d.offline_message = true;
        d.addCallback(function (i) {
            var k, j, h, g;
            Indicator.removeFromElm(b.parentNode);
            RCN(f, null);
            g = [];
            for (j = 0, h = i.length; j < h; j++) {
                k = i[j];
                g.push(ACN(f, ProjectList.renderItem(k, true)))
            }
            return g
        });
        d.addErrback(function () {
            return Indicator.removeFromElm(b.parentNode)
        });
        d.sendReq();
        return false
    };
    a.prototype.toggleArchive = function () {
        var b = this;
        if (!window.IsPremium) {
            return PromotionOverlay.show(_("Archiving a project is a premium feature"))
        } else {
            return ProjectList.withCurrentItem(function (c) {
                var d;
                d = c.json;
                if (d.is_archived) {
                    return b.unarchive(c)
                } else {
                    return b.archive(c)
                }
            })
        }
    };
    a.prototype.archive = function (b) {
        return this._doRequest("archive", b.json.id, function () {
            var h, f, d, g, c;
            ProjectsModel.deleteFromModel(b.json.id);
            ProjectsModel.syncCachedData();
            ItemsModel.syncCachedData();
            h = b.json.indent - 1;
            d = GenericManagerUtils.getChildren(b, true);
            d.reverse();
            for (g = 0, c = d.length; g < c; g++) {
                f = d[g];
                f.json.is_archived = true;
                f.json.indent -= h;
                removeElement(f);
                ATT($("projects_archived_ul"), ProjectList.renderItem(f.json, true))
            }
            ProjectList.arrows.updateArrows();
            ProjectMenu.hide(null, true);
            return Agenda.updateCounters()
        })
    };
    a.prototype.unarchive = function (b) {
        return this._doRequest("unarchive", b.json.id, function () {
            var h, d, g, c, f;
            f = GenericManagerUtils.getChildren(b, true);
            for (g = 0, c = f.length; g < c; g++) {
                d = f[g];
                removeElement(d)
            }
            h = {
                onSuccess: function () {
                    return setTimeout(function () {
                        ProjectList.refreshCurrent();
                        ProjectList.arrows.updateArrows();
                        ProjectMenu.hide(null, true);
                        return Agenda.updateCounters()
                    }, 50)
                }
            };
            return SyncEngine.sync(h, true)
        })
    };
    a.prototype._doRequest = function (f, b, d) {
        var c;
        c = loadJSONDoc("/Projects/" + f);
        c.offline_message = true;
        Indicator.show();
        c.addCallback(function () {
            Indicator.remove();
            if (isFunction(d)) {
                return d()
            }
        });
        c.addErrback(function () {
            return Indicator.remove()
        });
        return c.sendReq({
            id: b
        })
    };
    return a
})();
window.ProjectsArchive = new GProjectsArchive();
var GProjectEditorManager, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GProjectEditorManager = (function () {
    function a() {
        this.attachMouseMove = __bind(this.attachMouseMove, this);
        this.setAsActive = __bind(this.setAsActive, this);
        this.toggleProject = __bind(this.toggleProject, this);
        this.showProjects = __bind(this.showProjects, this);
        this.createEditorInstance = __bind(this.createEditorInstance, this);
        this.getEditorById = __bind(this.getEditorById, this);
        this.reset = __bind(this.reset, this);
        var b = this;
        this.current_cancel = null;
        this.current_form = null;
        this.current_holder = null;
        this.current_editors = [];
        Signals.connect("projects.rerender", function (l) {
            var j, d, i, g, f, k, c, h;
            d = {};
            h = b.current_editors;
            for (g = 0, k = h.length; g < k; g++) {
                j = h[g];
                d[j.project_id] = j
            }
            for (f = 0, c = l.length; f < c; f++) {
                i = l[f];
                j = d[parseInt(i)];
                if (j) {
                    j.reRender()
                }
            }
            return d = null
        });
        Signals.connect("project.name.changed", function (d) {
            var c;
            c = b.getEditorById(d.id);
            if (c) {
                return c.setProjectTitle(d.name)
            }
        })
    }
    a.prototype.reset = function (d) {
        var c, g, b, f;
        if (d == null) {
            d = true
        }
        this.current_cancel = null;
        this.current_form = null;
        this.current_editor = null;
        this.current_project_id = null;
        this.current_holder = null;
        if (d) {
            f = this.current_editors;
            for (g = 0, b = f.length; g < b; g++) {
                c = f[g];
                c.remove()
            }
            this.current_editors = []
        }
        return setEditOff()
    };
    a.prototype.getEditorById = function (c) {
        var d, g, b, f;
        f = this.current_editors;
        for (g = 0, b = f.length; g < b; g++) {
            d = f[g];
            if (d.project_id === c) {
                return d
            }
        }
        return null
    };
    a.prototype.createEditorInstance = function (b) {
        var c;
        c = new GProjectEditor(b);
        this.current_editors.push(c);
        return c
    };
    a.prototype.showProjects = function (f, j, g) {
        var d, c, i, h, b;
        if (!g) {
            g = {}
        }
        if (!g.holder) {
            g.holder = $("editor")
        }
        if (window.IS_MINI) {
            c = $("blank_state_project_list");
            if (c) {
                removeElement(c)
            }
        }
        this.reset();
        RCN(g.holder, null);
        this.current_holder = g.holder;
        if (f.length > 1) {
            addClass(g.holder, "project_editors_multiple")
        } else {
            removeClass(g.holder, "project_editors_multiple")
        }
        for (h = 0, b = f.length; h < b; h++) {
            d = f[h];
            i = this.createEditorInstance(d);
            i.holder = g.holder;
            if (!this.current_project_id) {
                if (g.update_location !== false) {
                    LocationManager.updateLocation("project/" + d)
                }
                this.setAsActive(i, true)
            }
            i.showProject()
        }
        if (isFunction(j)) {
            j()
        }
        return setTimeout(function () {
            return Signals.sendSignal("rendered.projects")
        }, 50)
    };
    a.prototype.toggleProject = function (j) {
        var b, f, d, i, h, c, g;
        b = null;
        d = [];
        g = this.current_editors;
        for (h = 0, c = g.length; h < c; h++) {
            f = g[h];
            if (f.project_id === j) {
                b = f
            } else {
                d.push(f)
            }
        }
        addClass(this.current_holder, "project_editors_multiple");
        if (b) {
            if (this.current_editor === b) {
                this.reset(false)
            }
            this.current_editors = d;
            b.remove();
            return false
        } else {
            i = this.createEditorInstance(j);
            i.holder = this.current_holder;
            i.showProject();
            return true
        }
    };
    a.prototype.setAsActive = function (b, c) {
        if (c == null) {
            c = false
        }
        if (c === false && this.current_form || EditorMenu.shown) {
            return
        }
        if (this.current_project_id === b.project_id) {
            return
        }
        this.current_project_id = b.project_id;
        this.current_editor = b;
        removeClass($bytc("div", "project_editor_instance"), "current_editor");
        addClass(b.editor_instance_div, "current_editor");
        return setTimeout(function () {
            return Signals.sendSignal("project_editor.changed", b)
        }, 10)
    };
    a.prototype.attachMouseMove = function (b) {
        var c = this;
        return AEV(b.editor_instance_div, "mouseover", function () {
            if (c.current_project_id !== b.project_id) {
                return c.setAsActive(b)
            }
        })
    };
    a.prototype.checkEmpty = function () {
        if (this.current_editor) {
            return this.current_editor.checkEmpty()
        }
    };
    a.prototype.removeEmpty = function () {
        if (this.current_editor) {
            return this.current_editor.removeEmpty()
        }
    };
    a.prototype.hideArrows = function () {
        var d, g, c, f, b;
        f = this.current_editors;
        b = [];
        for (g = 0, c = f.length; g < c; g++) {
            d = f[g];
            b.push(d.arrows.hideArrows())
        }
        return b
    };
    a.prototype.showArrows = function () {
        var d, g, c, f, b;
        f = this.current_editors;
        b = [];
        for (g = 0, c = f.length; g < c; g++) {
            d = f[g];
            b.push(d.arrows.showArrows())
        }
        return b
    };
    a.prototype.reRender = function () {
        var d, g, c, f, b;
        f = this.current_editors;
        b = [];
        for (g = 0, c = f.length; g < c; g++) {
            d = f[g];
            b.push(d.reRender())
        }
        return b
    };
    return a
})();
window.ProjectEditorManager = new GProjectEditorManager();
var GProjectExtraOptions, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GProjectExtraOptions = (function () {
    function a() {
        this.exportAsTemplate = __bind(this.exportAsTemplate, this);
        this.showImportTemplate = __bind(this.showImportTemplate, this);
        this.showEmails = __bind(this.showEmails, this)
    }
    a.prototype.showEmails = function (b) {
        var c;
        c = function (f) {
            var d;
            d = "/Emails/view?project_id=" + f;
            return GB_show(_("Add tasks via Email"), d, 500, 600)
        };
        return this.customShowGb(b, c)
    };
    a.prototype.showImportTemplate = function (b) {
        var c;
        if (!this.checkPremiumForTemplates()) {
            return false
        }
        c = function (f) {
            var d;
            d = "/ImportExport/showImport?project_id=" + f;
            return GB_show(_("Import from template"), d, 500, 600)
        };
        return this.customShowGb(b, c)
    };
    a.prototype.exportAsTemplate = function (b) {
        var c;
        if (!this.checkPremiumForTemplates()) {
            return false
        }
        c = function (f) {
            var d;
            d = "/ImportExport/exportProject?project_id=" + f;
            window.open(d);
            return false
        };
        return this.customShowGb(b, c)
    };
    a.prototype.customShowGb = function (b, c) {
        Indicator.show();
        ProjectGearMenu.hide(null, true);
        return TemporaryIds.waitToResolve(b, function (d) {
            Indicator.remove();
            return c(d)
        })
    };
    a.prototype.checkPremiumForTemplates = function () {
        if (window.IsPremium) {
            return true
        } else {
            PromotionOverlay.show(_("Templates are a premium feature"));
            return false
        }
    };
    return a
})();
window.ProjectExtraOptions = new GProjectExtraOptions();
ProjectEditorGeneric = {
    init: function () {
        generateProjectGearMenu();
        generateProjectEditorMenu();
        generatePriorityMenu();
        TemporaryIds.listenAll(function (b, a) {
            var c = "item_" + a;
            var g = "item_" + b;
            var f = $(g);
            if (f) {
                f.id = c;
                removeClass(f, g);
                addClass(f, c)
            }
            var d = ProjectEditorManager.getEditorById(b);
            if (d) {
                d.project_id = a
            }
            if (ProjectEditorManager.current_project_id == b) {
                ProjectEditorManager.current_project_id = a
            }
        })
    },
    onShowMenu: function (b, a) {
        selectPriority(a, b.json.priority)
    },
    flashItem: function (b) {
        ProjectList.flash_item = null;
        var a = $("item_" + b);
        GenericManagerUtils.openParents(a);
        if (a && !isElementHidden(a)) {
            AJS.fx.highlight(a, {
                duration: 2000
            });
            window.scrollTo(0, absolutePosition(a).y - 200)
        }
    }
};
GProjectEditor = GenericManager.extend({
    init: function (a) {
        var b = {
            list_class: "ProjectEditor",
            data_model: ItemsModel,
            max_indent: 5,
            arrows: new GenericArrows({
                data_model: ItemsModel
            }),
            state_manager: ProjectEditorManager,
            empty_text: _("This project has no tasks. Add some now!")
        };
        b.arrows.setList(this);
        this.parent(b);
        this.project_id = a;
        this.current_limit = 0;
        this.history_fetch_count = 0;
        this.menu = EditorMenu;
        bindMethods(this)
    },
    remove: function () {
        removeElement(this.current_list, this.current_his_list, this.editor_instance_div, this.right_task_actions_div, this.history_icon_div);
        ElementStore.remove(this.editor_instance_div);
        this.state_manager = null;
        this.current_list = null;
        this.current_his_list = null;
        this.menu = null;
        this.arrows.data_model = null;
        this.arrows = null;
        this.editor_instance_div = null;
        this.project_name_span = null
    },
    showProject: function () {
        var c = this;
        var a = ProjectsModel.get(this.project_id);
        if (a) {
            var b = ItemsModel.getByProjectId(a.id);
            return c._showProject(a, b)
        } else {
            Indicator.show();
            var d = loadJSONDoc("/Projects/getN");
            d.offline_message = true;
            d.addCallback(function (f) {
                Indicator.remove();
                c._showProject(f.project, f.items)
            });
            d.addErrback(function (f) {
                Indicator.remove();
                alert(f)
            });
            d.sendReq({
                id: this.project_id
            })
        }
    },
    _showProject: function (a, d) {
        var c = this;
        this.render();
        InfoPage.hide();
        var b = this.current_list = UL({
            c: "items"
        });
        ACN(b, LI({
            c: "reorder_item task_item"
        }));
        var f = this.current_his_list = UL({
            c: "items history",
            id: "project_history"
        });
        map(d, function (k, j) {
            var h = c.renderItem(k);
            ACN(b, h)
        });
        GenericManagerUtils.showChildren($FA(b.childNodes));
        RCN(this.list_editor, c.renderProjectHeader(a));
        ACN(this.list_editor, b);
        RCN(this.history_editor, null);
        swapDOM(this.history_editor, this.history_editor = DIV({
            c: "history_desc"
        }, f));
        if (this.edit_on_load) {
            var g = this.edit_on_load;
            map($FA(this.current_list.childNodes), function (h) {
                if (h.json.id == g) {
                    c.current_item = h;
                    c.editCurrentItem()
                }
            });
            this.edit_on_load = null
        }
        this.checkEmpty();
        if (ProjectList.flash_item) {
            ProjectEditorGeneric.flashItem(ProjectList.flash_item)
        }
        c.arrows.updateArrows();
        if (a.is_archived) {
            hideElement(this.controller)
        } else {
            showElement(this.controller)
        }
        hideElement(this.history_editor, this.history_controller);
        showElement(this.history_icon_div)
    },
    renderProjectHeader: function (a) {
        this.project_name_span = SPAN();
        this.setProjectTitle(a.name);
        var c = A({
            href: "#",
            c: "project_link"
        }, this.project_name_span);
        AEV(c, "click", function () {
            ProjectList.setCurrentById(a.id, null, null, false);
            window.scroll(0, 0);
            return false
        });
        var b = H2({
            c: "project_header section_header"
        }, this.right_task_actions_div = this.renderActions(), c);
        if (a.is_archived) {
            ACN(b, SPAN({
                c: "desc"
            }, _("Archived")))
        }
        return b
    },
    setProjectTitle: function (a) {
        setHTML(this.project_name_span, Formatter.format(a))
    },
    showHistory: function (a) {
        showElement(this.history_editor, this.history_controller);
        hideElement(this.history_icon_div);
        this.getMoreHistory();
        return false
    },
    getMoreHistory: function () {
        var a = this;
        actionPerfomed();
        var c = this.fetch_history;
        hideElement(c);
        this.history_fetch_count++;
        Indicator.addToElm(c.parentNode);
        var b = loadJSONDoc("Items/getMoreHistory");
        b.offline_message = true;
        b.addCallback(function (f) {
            var j = a.current_his_list;
            removeElement($bytc("li", "empty", j));
            Indicator.removeFromElm(c.parentNode);
            map(f.completed, function (m, l) {
                var k = a.renderHistoryItem(m);
                ACN(j, k)
            });
            var h = a.history_fetch_count;
            var d = f.completed.length;
            if (h == 1 && d < 10 && d > 0) {} else {
                if (f.completed.length < 10) {
                    var g;
                    var i;
                    if (h > 1) {
                        i = _("No more completed tasks")
                    } else {
                        i = _("No completed tasks")
                    }
                    ACN(j, g = LI({
                        c: "empty"
                    }, i));
                    AJS.fx.fadeOut(g, {
                        duration: 3000,
                        onComplete: function () {
                            removeElement(g)
                        }
                    })
                } else {
                    showElement(c)
                }
            }
            a.arrows.updateArrows();
            a.current_limit += f.completed.length
        });
        b.addErrback(function () {
            Indicator.removeFromElm(c.parentNode)
        });
        if (this.current_limit == 0) {
            this.current_limit = this.current_his_list.childNodes.length
        }
        b.sendReq({
            current_limit: this.current_limit,
            project_id: this.project_id
        });
        return false
    },
    clearCompletedTasks: function () {
        var a = this;
        var b = _("Are you sure you want to delete all the completed items?");
        Alerts.confirm(b, function (d) {
            if (d) {
                var c = getRequest("Items/deleteCompleted");
                c.offline_message = true;
                c.addCallback(function () {
                    var f = UL({
                        c: "items history"
                    });
                    swapDOM(a.current_his_list, f);
                    a.current_his_list = f
                });
                c.sendReq({
                    user_id: window.UserId,
                    project_id: a.project_id
                })
            }
        });
        return false
    },
    renderItem: function (f, d) {
        var b = this;
        if (!d) {
            d = {
                fn_toggle_menu: this.toggleMenu,
                fn_complete_item: this.completeItem,
                fn_undo_complete_item: this.undoCompleteItem,
                with_due_date: true
            }
        }
        var a = ItemsRender.renderItem(f, d);
        var c = true;
        if (f.is_archived || d.not_editable) {
            c = false
        }
        if (c) {
            ItemForms.doubleClick(a.content, function (g) {
                b.saveCurrentItem(function () {
                    EditorMenu.current_holder = null;
                    b.current_item = a;
                    b.editCurrentItem()
                });
                return true
            })
        }
        return a
    },
    render: function () {
        this.controller = DIV({
            c: "controller actions pe_controller"
        });
        this.add_item = A({
            href: "",
            c: "action"
        }, _("Add task"));
        this.add_item.onclick = this.addNewItem;
        ACN(this.controller, this.add_item);
        var b;
        ATT(this.controller, this.history_icon_div = DIV({
            c: "history_icon"
        }, b = A({
            href: "#"
        }, imageSprite("cmp_history_big", 26, 16))));
        AmiTooltip.showSimpleText(b, _("Show completed tasks"));
        AEV(b, "click", this.showHistory);
        this.history_editor = DIV({
            c: "list_editor history"
        });
        this.history_controller = DIV({
            c: "controller actions his_ctrl"
        });
        this.fetch_history = A({
            href: "#",
            c: "action"
        }, _("Fetch more completed"), "...");
        AEV(this.fetch_history, "click", this.getMoreHistory);
        RCN(this.history_controller, this.fetch_history);
        hideElement(this.history_controller, this.history_editor);
        this.list_editor = DIV({
            c: "list_editor"
        });
        var a = this.holder;
        if (!a) {
            a = $("editor")
        }
        ACN(a, this.editor_instance_div = DIV({
            c: "project_editor_instance"
        }, this.list_editor, this.controller, this.history_editor, this.history_controller));
        ElementStore.set(this.editor_instance_div, "editor", this);
        if (ProjectEditorManager.current_project_id == this.project_id) {
            addClass(this.editor_instance_div, "current_editor")
        }
        ProjectEditorManager.attachMouseMove(this)
    },
    renderActions: function () {
        var a = imageSprite("cmp_task_actions icon", 26, 16);
        AmiTooltip.showSimpleText(a, _("Task Actions"));
        AEV(a, "click", function () {
            AmiTooltip.hide();
            return ProjectGearMenu.toggle(a, a)
        });
        return DIV({
            c: "right_task_actions"
        }, a)
    },
    renderHistoryItem: function (i) {
        var k = this;
        ItemsModel._addToModel(i, true, false);
        var g = Formatter.format(i.content);
        var d = TBODY();
        var j = TABLE(d);
        var l = TD();
        var b = TD({
            c: "content"
        });
        ACN(d, TR(l, b));
        var c = ItemDueDates.create(i);
        var f = SPAN();
        setHTML(f, g);
        ACN(b, c, f);
        var h = LI({
            c: "task_item history_item",
            id: "item_" + i.id
        }, j);
        addClass(h, "item_" + i.id);
        h.json = i;
        Notes.annotate(i, f, h);
        ACN(b, setHTML(DIV(), Labels.format("", i)));
        if (i.indent == 1) {
            var a = ItemCheckbox.create(h, this.undoCompleteItem);
            ACN(l, DIV({
                c: "div_checker"
            }, a));
            AmiCheckbox.setChecked(a, 1)
        }
        GenericManagerUtils.setIndent(h, i.indent);
        return h
    },
    reRender: function () {
        var d = this;
        var a = ProjectsModel.get(this.project_id);
        if (a) {
            var c = ItemsModel.getByProjectId(a.id);
            var b = UL({
                c: "items"
            });
            ACN(b, LI({
                c: "reorder_item task_item"
            }));
            map(c, function (h, g) {
                var f = d.renderItem(h);
                ACN(b, f)
            });
            GenericManagerUtils.showChildren($FA(b.childNodes));
            RCN(d.current_list, b);
            d.current_list = b
        }
        this.arrows.updateArrows()
    },
    addItem: function (f, h) {
        var d = this;
        setEditOn();
        var a = getParentBytc(f, "li");
        var g = ItemForms.parseFormData(f);
        if (!g) {
            return false
        }
        ItemEdit.genericAddItem(f, g);
        if (g.content != "") {
            var b = ItemsModel.add(g);
            if (BufferedRemindersModel.reminders.length > 0) {
                BufferedRemindersModel.commitBuffered(b)
            }
            var c = d.renderItem(b);
            swapDOM(a, c);
            AJS.fx.highlight(c);
            this.editingDone(c);
            if (isFunction(h)) {
                h(b)
            } else {
                setTimeout(function () {
                    d.showAddItem(true, false)
                }, 1)
            }
            d.incNextSiblings(c)
        } else {
            this.current_item = a;
            if (isFunction(h)) {
                h(true)
            }
        }
        return false
    },
    showAddItem: function (c, d, i) {
        EditorMenu.hide(true, null);
        ProjectEditorManager.setAsActive(this);
        var j = this;
        removeElement($("blank_state_project_editor"));
        this.parent(c, d, i);
        var a = function () {
            BufferedRemindersModel.reset();
            j.checkEmpty();
            j.arrows.updateArrows();
            MiniCal.remove();
            ItemEdit.genericCancelEdit()
        };
        var g = {
            cancel: ItemForms.genCancel("li", a, ProjectEditorManager),
            action: j.addItem,
            submit_val: _("Add task"),
            submit_icon: "cmp_add",
            name_val: "",
            indent_arrows: true
        };
        var f = ItemEdit.generateForm(g);
        ProjectEditorManager.current_cancel = g.cancel;
        ProjectEditorManager.current_form = f.form;
        var h = f.li_item;
        if (c == true) {
            var b = GenericManagerUtils.getIndent(this.current_item) || 1;
            GenericManagerUtils.setIndent(h, b)
        } else {
            h.indent = GenericManagerUtils.getIndent(h)
        }
        h.priority = 1;
        ProjectEditorManager.current_editor.insertForm(f.li_item, d);
        f.textarea.focus();
        return false
    },
    addNewItem: function (c, d) {
        var a = this;
        actionPerfomed();
        var b = function () {
            EditorMenu.current_holder = null;
            if (c == true) {
                a.current_item = a.getItem(getFirst)
            } else {
                a.current_item = a.getItem(getLast)
            }
            a.showAddItem(false, c == true, true);
            if (isFunction(d)) {
                d()
            }
        };
        ProjectEditorManager.current_editor.saveCurrentItem(b);
        return false
    },
    saveItem: function (d, h) {
        var b = this;
        var g = ProjectEditorManager.current_form;
        var f = ProjectEditorManager.current_editor.current_item;
        var c = ItemEdit.genericSaveItem(f, g);
        if (!c) {
            return
        }
        var a = b.renderItem(c.item);
        swapDOM(f, a);
        if (c.is_updated) {
            AJS.fx.highlight(a)
        }
        this.editingDone(a);
        if (isFunction(h)) {
            h()
        }
        return false
    },
    editCurrentItem: function () {
        EditorMenu.hide(true, null);
        MiniCal.remove();
        ProjectEditorManager.setAsActive(this);
        var b = this;
        this.parent();
        var h = this.current_item;
        AmiTooltip.hide();
        var c = function () {
            showElement(h);
            b.arrows.updateArrows();
            MiniCal.remove();
            ItemEdit.genericCancelEdit()
        };
        var f = h.json.due_date;
        var d = h.json.date_string || "";
        var a = {
            cancel: ItemForms.genCancel("li", c, ProjectEditorManager),
            action: b.saveItem,
            submit_val: _("Save"),
            submit_icon: "cmp_save",
            name_val: h.json.content,
            due_date: f,
            date_string: d,
            current_item: h,
            indent_arrows: true,
            priority: h.json.priority
        };
        var g = ItemEdit.generateForm(a);
        ProjectEditorManager.current_cancel = a.cancel;
        ProjectEditorManager.current_form = g.form;
        insertAfter(g.li_item, h);
        setTimeout(function () {
            var i = g.textarea;
            i.resize();
            LibEdit.placeCursor(i, i.value.length)
        }, 1)
    },
    completeItem: function (a, f, g) {
        var b = this;
        actionPerfomed();
        if (f && f.shift) {
            g = true
        }
        var c = ItemsModel.complete(a.json.id, g);
        var d = false;
        rmap(c, function (i) {
            var j = $("item_" + i.id);
            if (!j) {
                return
            }
            update(j.json, i);
            if (i.in_history) {
                d = true;
                if (j.json) {
                    removeElement(j);
                    var h = b.renderHistoryItem(j.json);
                    appendToTop(b.current_his_list, h)
                } else {
                    appendToTop(b.current_his_list, j)
                }
            } else {
                if (i.checked) {
                    ItemCheckbox.update(j, 1, b.undoCompleteItem)
                } else {
                    ItemCheckbox.update(j, 0, b.completeItem);
                    ItemDueDates.updateDueDate(j)
                }
            }
        });
        b.arrows.updateArrows();
        b.checkEmpty();
        Agenda.updateCounters();
        if (d) {
            showElement(this.history_editor, this.history_controller);
            hideElement(this.history_icon_div)
        }
    },
    undoCompleteItem: function (a, d) {
        var c = this;
        actionPerfomed();
        map(GenericManagerUtils.getChildren(a, true), function (g) {
            ItemsModel._addToModel(g.json, true, false)
        });
        var f = null;
        if (a.json.in_history) {
            f = [];
            map(GenericManagerUtils.getChildren(a, true), function (g) {
                f.push(g.json)
            });
            if (f.length == 0) {
                f = null
            }
        }
        var b = ItemsModel.uncomplete(a.json.id, a.json.in_history == 1, f);
        map(b, function (h) {
            var i = $("item_" + h.id);
            if (!i) {
                return
            }
            if (hasClass(i, "history_item")) {
                removeElement(i);
                var g = c.renderItem(h);
                ACN(c.current_list, g)
            } else {
                ItemCheckbox.update(i, 0, c.completeItem)
            }
        });
        c.arrows.updateArrows();
        c.checkEmpty();
        Agenda.updateCounters()
    },
    forceComplete: function () {
        var a = this;
        this.withCurrentItem(function (b) {
            a.completeItem(b, {
                shift: true
            }, true)
        })
    },
    editingDone: function (a) {
        ProjectEditorManager.current_cancel = null;
        ProjectEditorManager.current_form = null;
        this.arrows.updateArrows();
        this.current_item = a;
        Agenda.updateCounters();
        setEditOff()
    },
    deleteCurrentItem: function () {
        return ItemCommonEdits.deleteCurrentItem(this)
    },
    updatePriority: function (a) {
        this.withCurrentItem(function (b) {
            ItemCommonEdits.updatePriority(b, a)
        })
    },
    showMoveTo: function (a) {
        this.withCurrentItem(function (b) {
            ItemSelecter.toggle(b);
            ItemSelecter.moveItems($b(ItemSelecter.deselectAll, ItemSelecter))
        })
    },
    checkEmpty: function () {
        var b = this.parent();
        var d = $("blank_state_project_editor");
        var a = ItemsModel.getAll().length == 0;
        if (ProjectList.isEmpty()) {
            if (window.IS_MINI) {
                if (!ProjectEditorManager.current_editor) {
                    a = false
                }
            } else {
                a = false
            }
        }
        if (a && !d) {
            var f = DIV({
                id: "blank_state_project_editor"
            }, IMG({
                src: "https://d3ptyyxy2at9ui.cloudfront.net/59e72a9d92913597fc32b44e7b8e4430.png"
            }), DIV({
                c: "blank_state_text"
            }, B(_("Add your first task")), DIV(_("Keep a track of what needs to get done.")), DIV(_("Start adding your tasks now!"))));
            AJS.fx.fadeIn(f);
            ACN($("editor"), f);
            if (window.IS_MINI) {
                if (this.controller) {
                    var c = absolutePosition(this.controller).x;
                    setLeft(f, c)
                }
            }
        } else {
            if (!a && d) {
                removeElement(d)
            } else {
                if (!a) {
                    InfoPage.checkPromotion()
                }
            }
        }
        PremiumPromotion.checkEmpty()
    },
    toggleMenu: function (b, d, c, a) {
        if (b.disabled) {
            return false
        }
        ProjectEditorGeneric.onShowMenu(b, EditorMenu);
        EditorMenu.toggle(d, b, a);
        ProjectMenu.hide(null, true);
        return false
    }
});
var GPremiumPromotion, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GPremiumPromotion = (function () {
    function a() {
        this._countdown = __bind(this._countdown, this);
        this.annotateDiscount = __bind(this.annotateDiscount, this)
    }
    a.prototype.checkEmpty = function () {
        var b, c;
        if (window.IsPremium) {
            return
        }
        c = function () {
            var d;
            d = ProjectsModel.getAll();
            if (d.length === 1 && d[0].cache_count === 0) {
                return true
            } else {
                return false
            }
        };
        b = $("premium_promotion");
        if (window.NATIVE_APP === "mac_store") {
            return hideElement(b)
        } else {
            if (ProjectList.isEmpty() || c()) {
                return hideElement(b)
            } else {
                if (isElementHidden(b)) {
                    showElement(b);
                    return AJS.fx.fadeIn(b)
                }
            }
        }
    };
    a.prototype.annotateDiscount = function (f) {
        var b, c, d = this;
        b = $("premium_promotion");
        if (!b) {
            return
        }
        c = function () {
            var g, h;
            g = d._countdown(f.getFullYear(), f.getMonth() + 1, f.getDate(), f.getHours(), f.getMinutes());
            if (g) {
                h = _("Upgrade within %s and get %s%% off!");
                h = h.replace("%s%", "35").replace("%s", g);
                return setHTML(b, h)
            } else {
                return setHTML(b, _("Upgrade and get more done!"))
            }
        };
        c();
        return setInterval(c, 10000)
    };
    a.prototype._countdown = function (l, i, m, g, d) {
        var n, f, o, b, h, k, c, p, j;
        k = new Date();
        j = k.getFullYear();
        p = k.getMonth();
        c = new Date(j, p, k.getDate(), k.getHours(), k.getMinutes(), k.getSeconds());
        b = new Date(l, i - 1, m, g, d, 0);
        h = Math.round((b.getTime() - c.getTime()) / 1000);
        if (h < 0) {
            h = 0
        }
        o = h % 60;
        f = Math.floor(h / 60) % 60;
        n = Math.floor(h / 3600);
        if (n === 0 && f === 0) {
            return ""
        } else {
            if (n <= 0) {
                return "" + f + "m"
            } else {
                return "" + n + "h " + f + "m"
            }
        }
    };
    return a
})();
window.PremiumPromotion = new GPremiumPromotion();
var GQuickAddTasks, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GQuickAddTasks = (function () {
    a.prototype.shown = false;
    a.prototype.old_offset_x = 0;
    a.prototype.support_annotation = true;

    function a() {
        this.checkAnnotation = __bind(this.checkAnnotation, this);
        this.hide = __bind(this.hide, this);
        this.refershCurrentView = __bind(this.refershCurrentView, this);
        this.addTask = __bind(this.addTask, this);
        this.toggle = __bind(this.toggle, this);
        var b = this;
        AEV(document, ["keydown", "keypress"], function (c) {
            if (!c.meta && !c.alt && c.keyAscii === 81 && c.ctrl) {
                b.toggle();
                preventDefault(c);
                return false
            }
        })
    }
    a.prototype.toggle = function () {
        var f, g, b, d, c, h = this;
        if (this.shown) {
            return false
        }
        setEditOn();
        this.old_offset_x = MiniCal.offset_x;
        MiniCal.offset_x = -40;
        addClass(getBody(), "body_quick_add_task");
        this.shown = true;
        AmiTooltip.hide();
        if (ProjectsModel.getAll().length === 0) {
            this.shown = false;
            alert(DIV(B(_("You have no projects")), BR(), _("Tasks are added to projects."), " ", _("Add your first project now!")));
            return false
        }
        d = this.renderProjectList();
        AEV(d, "keydown", function (i) {
            if (i.keyAscii === 9 && !AmiComplete.shown()) {
                $f($gp(d, "form"), "ta").focus();
                return preventDefault(i)
            }
        });
        f = {
            cancel: ItemForms.genCancel("li", this.hide, this, " "),
            action: this.addTask,
            submit_val: _("Add task"),
            submit_icon: "cmp_add",
            name_val: "",
            indent_arrows: false,
            no_indent: true,
            due_date_focus: function () {
                return d.focus()
            }
        };
        g = ItemEdit.generateForm(f, {
            fixed_pos: true
        });
        setHeight(g.textarea, 19);
        ATT(g.form, DIV({
            c: "select_project"
        }, d));
        b = DIV({
            c: "quick_add_task manager",
            id: "quick_add_task"
        }, g.form);
        if (window.IS_MINI) {
            ACN(b, this.quick_add_annotate = DIV({
                id: "quick_add_annotate"
            }, this.quick_annotate_link = A({
                href: "#",
                "class": "action",
                id: "quick_annotate_link"
            }, this.quick_annotate_icon = null, this.quick_annotate_text = SPAN(_("Attach email to task")))));
            hideElement(this.quick_add_annotate)
        }
        c = 350;
        this.task_added = false;
        TooptipWin.show(_("Add Task"), b, 210, c, {
            fn_on_hide: this.hide,
            fn_arrow_right: function () {
                if (window.IS_MINI) {
                    return 57
                } else {
                    return 98
                }
            },
            close_validator_fn: function () {
                var i, k, j;
                i = g.textarea;
                if (h.task_added) {
                    return true
                }
                j = strip(i.value);
                if (j.length !== 0) {
                    k = confirm(_("Are you sure you want to cancel your current task?"));
                    if (!k) {
                        i.focus();
                        return false
                    }
                }
                BufferedRemindersModel.reset();
                return true
            },
            fn_left_offset: function (k, j) {
                var i;
                i = getWindowSize();
                if (window.IS_MINI) {
                    return i.w - j.width - 49
                } else {
                    return i.w - j.width - 45
                }
            },
            fn_top_offset: function (k, j) {
                var i;
                i = 35;
                if (window.IS_MINI) {
                    if (hasClass(getBody(), "selected_top")) {
                        i = 52
                    } else {
                        i = 30
                    }
                }
                return i
            },
            fixed_pos: true
        });
        g.textarea.focus();
        if (window.IS_MINI && this.support_annotation) {
            this.checkAnnotation();
            this.interval_set = setInterval(this.checkAnnotation, 400)
        }
        return false
    };
    a.prototype.renderProjectList = function () {
        var c, d, j, f, i, h, b, g;
        f = ProjectEditorManager.current_project_id;
        i = SELECT({
            name: "project_id"
        });
        g = ProjectsModel.getAll();
        for (h = 0, b = g.length; h < b; h++) {
            j = g[h];
            c = j.name.replace(/\*\s*/, "");
            ACN(i, d = OPTION({
                value: j.id
            }, trimIfNeeded(c, 45)));
            if (f === j.id) {
                d.selected = true
            }
        }
        return i
    };
    a.prototype.addTask = function (d) {
        var f, c, b;
        f = ItemForms.parseFormData(d);
        if (!f || f.content === "") {
            $f(d, "ta").focus();
            return false
        }
        ItemEdit.genericAddItem(d, f);
        delete f.item_order;
        f.project_id = parseInt(getSelectValue($f(d, "project_id")));
        b = ItemsModel.getByProjectId(f.project_id);
        if (b.length > 0) {
            f.item_order = getLast(b).item_order + 1
        }
        c = ItemsModel.add(f);
        if (BufferedRemindersModel.reminders.length > 0) {
            BufferedRemindersModel.commitBuffered(c)
        }
        if (c.due_date) {
            Agenda.flash_item = c.id;
            Agenda.query(DateController.formatDate(c.due_date))
        } else {
            ProjectList.setCurrentById(c.project_id);
            ProjectEditorGeneric.flashItem(c.id)
        }
        Agenda.updateCounters();
        this.task_added = true;
        this.hide();
        return false
    };
    a.prototype.refershCurrentView = function (b) {
        return LocationManager.refreshView()
    };
    a.prototype.hide = function () {
        if (this.interval_set) {
            clearTimeout(this.interval_set);
            this.interval_set = null;
            this.annotate_text = null;
            this.annotate_fn = null
        }
        ItemEdit.genericCancelEdit();
        setEditOff();
        this.support_annotation = true;
        this.shown = false;
        MiniCal.offset_x = this.old_offset_x;
        removeClass(getBody(), "body_quick_add_task");
        AmiComplete.hide();
        if ($bytc("div", "manage_reminders").length > 0) {
            GB_hide()
        }
        GB_hide();
        return true
    };
    a.prototype.checkAnnotation = function () {
        var f, g, d, c, b;
        d = $("quick_add_task");
        if (!d) {
            return
        }
        c = false;
        g = _("Add email as task");
        if (OutlookIntegration.current_email_obj) {
            f = OutlookIntegration.addToTextArea;
            c = true
        } else {
            if (getCurHref()) {
                c = true;
                if (!isGmailCurHref()) {
                    g = _("Add website as task")
                }
                f = SideBar.addToTextArea
            } else {
                if (window.CUR_HREF && window.CUR_HREF.unique_id) {
                    c = true;
                    f = SideBar.addToTextArea
                }
            }
        } if (c) {
            if (isElementHidden(this.quick_add_annotate)) {
                AJS.fx.fadeIn(this.quick_add_annotate, {
                    duration: 300
                });
                showElement(this.quick_add_annotate)
            }
            if (this.annotate_fn !== f || this.annotate_text !== g) {
                b = $gc($("quick_add_task"), "textarea", "text_box");
                this.quick_annotate_link.onclick = $p(f, b);
                setHTML(this.quick_annotate_text, g);
                this.annotate_fn = f;
                return this.annotate_text = g
            }
        } else {
            return hideElement(this.quick_add_annotate)
        }
    };
    return a
})();
window.QuickAddTasks = new GQuickAddTasks();
var GTopIcons;
GTopIcons = (function () {
    function a() {}
    a.prototype.render = function () {
        var c, b, f, d;
        d = $("top_icons");
        f = " (CTRL+Q)";
        ACN($("logo"), Notifications.renderIcon());
        ACN(d, c = this.createIcon("cmp_plus_on", _("Add Task") + f, function () {
            return QuickAddTasks.toggle()
        }));
        c.id = "icon_add_task";
        ACN(d, b = this.createIcon("cmp_info_on", _("Help and Reference"), function () {
            return InfoPage.toggle(this)
        }));
        b.id = "info_page";
        ACN(d, this.createIcon("cmp_gear", _("Settings"), function () {
            return UserMenu.toggle(this)
        }));
        return ATT($("top_right"), SyncStateIcon.render())
    };
    a.prototype.createIcon = function (b, f, d) {
        var c;
        c = imageSprite("" + b + " icon fixed_pos", 26, 16);
        if (f) {
            AmiTooltip.showSimpleText(c, f)
        }
        if (d) {
            AEV(c, "click", d)
        }
        return c
    };
    return a
})();
window.TopIcons = new GTopIcons();
var GPostpone, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GPostpone = (function () {
    function a() {
        this.postPoneUpdate = __bind(this.postPoneUpdate, this);
        this.postPoneFromMenuItem = __bind(this.postPoneFromMenuItem, this)
    }
    a.prototype.postPoneFromMenuItem = function (d) {
        var b, f, c;
        c = getCurrentMenuController(), b = c[0], f = c[1];
        this.postPoneUpdate([b.current_item]);
        return f.hide(null, true)
    };
    a.prototype.postPoneUpdate = function (l, g) {
        var i, n, m, b, j, c, h, d, k, f;
        if (g == null) {
            g = false
        }
        j = [];
        b = {};
        for (d = 0, k = l.length; d < k; d++) {
            m = l[d];
            if (!m.json) {
                continue
            }
            f = this.getNewDate(m.json, false), h = f[0], c = f[1], i = f[2], n = f[3];
            if (!m.json.date_string) {
                m.json.date_string = DateController.formatDate(DateBocks.magicDate("tomorrow"))
            }
            ItemsModel.update(m.json.id, {
                due_date: h,
                date_string: m.json.date_string
            });
            j.push(m)
        }
        ItemSelecter._updateDueDates(j, true, g);
        AmiTooltip.hide();
        Agenda.updateCounters();
        return false
    };
    a.prototype.getNewDate = function (d, m) {
        var g, h, l, j, n, c, k, b, f, i;
        if (m == null) {
            m = false
        }
        b = DateBocks.getNow();
        g = d.due_date;
        n = RecurringDates.isEveryDate(d.date_string);
        j = DateController.isOverdue(b, g);
        if (g && n) {
            k = RecurringDates.getNonOverdueDate(g, d.date_string, true)
        } else {
            if (g && !j) {
                k = new Date(d.due_date.getTime());
                k.setDate(k.getDate() + 1)
            } else {
                f = DateController.getTime(d.date_string, true);
                i = DateBocks.magicDate("tom " + f);
                i.tz_set = true;
                k = i
            }
        }
        c = DateController.jsonFormat(k, DateController.hasTime(d.date_string));
        l = "";
        if (m) {
            h = DateController.dayDiff(k);
            l = DateController.humanizeDayDiff(h, k)
        }
        return [k, c, l, n]
    };
    return a
})();
window.Postpone = new GPostpone();
var GDoItToday, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GDoItToday = (function () {
    function a() {
        this.changeToToday = __bind(this.changeToToday, this);
        this.changeToTodayMenu = __bind(this.changeToTodayMenu, this)
    }
    a.prototype.changeToTodayMenu = function () {
        var b, d, c;
        c = getCurrentMenuController(), b = c[0], d = c[1];
        this.changeToToday([b.current_item]);
        return d.hide(null, true)
    };
    a.prototype.changeToToday = function (f) {
        var b, h, g, j, d, i, c;
        for (i = 0, c = f.length; i < c; i++) {
            h = f[i];
            g = h.json;
            if (!g) {
                continue
            }
            b = RecurringDates.isEveryDate(g.date_string);
            if (g.due_date) {
                j = DateController.getTime(g.date_string, true);
                d = DateBocks.magicDate("today " + j)
            } else {
                d = DateBocks.magicDate("today");
                g.date_string = DateController.formatDate(d)
            }
            ItemsModel.update(g.id, {
                due_date: d,
                date_string: g.date_string
            });
            ItemSelecter._updateDueDates([h], true, false)
        }
        AmiTooltip.hide();
        Agenda.updateCounters();
        return false
    };
    return a
})();
window.DoItToday = new GDoItToday();
WindowOpener = {
    showKeyboardShortcuts: function () {
        return GB_show(_("Keyboard shortcuts"), "/Help/viewKeyboardShortcuts", 480, 600)
    },
    showPrefs: function (b) {
        if (!b) {
            b = "general"
        }
        if (b == "premium") {
            top.location = "https://" + top.location.host + "/PremiumLanding/show";
            return false
        }
        if (b == "invite_friends") {
            return GB_show(_("Todoist Premium"), "/PremiumLanding/showInviteFriends", 650, 980)
        }
        var a = "/Users/viewPrefs";
        a += "?page=" + b;
        return GB_show(_("Todoist Settings"), a, 550, 750)
    },
    showKarmaInfo: function () {
        var a = 500;
        if (window.IS_MINI) {
            a = 250
        }
        return GB_show(_("More about Todoist Karma"), "/Karma/showInfo", 550, a)
    }
};
AEV(window, "message", function (a) {
    if (a && a.data && a.data.indexOf("show_premium") != -1) {
        WindowOpener.showPrefs("premium")
    }
});
OutlookIntegration = {
    current_email_obj: null,
    controller: null,
    annotateProjectController: function () {
        var d = OutlookIntegration.current_email_obj;
        var b = ProjectEditorManager.current_editor;
        if (!b) {
            setTimeout(OutlookIntegration.annotateProjectController, 500);
            return
        }
        var a = b.controller;
        var c = $("add_outlook");
        if (!d) {
            if (c) {
                removeElement(c)
            }
            return
        }
        if (!c || a != OutlookIntegration.controller) {
            if (c) {
                removeElement(c)
            }
            var c = A({
                href: "#",
                "class": "action",
                id: "add_outlook"
            }, _("Add email as task"));
            AEV(c, "click", OutlookIntegration.addCurrentAsTask);
            ACN(a, c);
            OutlookIntegration.controller = a
        }
    },
    addToTextArea: function (a) {
        var b = OutlookIntegration.current_email_obj;
        if (!b) {
            return false
        }
        ContentTransformers.type = "outlook";
        ContentTransformers.email_id = b.id;
        ContentTransformers.title = b.subject;
        ContentTransformers.annotateWithIcon(a);
        LibEdit.insertAtCursor(a, b.subject + " ");
        return false
    },
    addCurrentAsTask: function () {
        var b = OutlookIntegration.current_email_obj;
        if (b) {
            var a = ProjectEditorManager.current_editor;
            a.addNewItem(false, function () {
                var c = $f(ProjectEditorManager.current_form, "ta");
                OutlookIntegration.addToTextArea(c);
                _gaq.push(["_trackEvent", "Outlook", "Add", "AddedEmail"])
            })
        }
        return false
    },
    setCurrentEmail: function (a) {
        if (!a) {
            OutlookIntegration.current_email_obj = null
        } else {
            var b = OutlookIntegration.current_email_obj = {};
            update(b, a)
        }
        OutlookIntegration.annotateProjectController()
    },
    addToProject: function (a) {
        MoveItems.showOverlay({
            cancel_text: _("Cancel add"),
            header: _("Add Email To Project")
        });
        GB_getLast().addCallback(function () {
            MoveItems.resetProjectList();
            var b = MoveItems.selected_project;
            if (b) {
                ProjectList.setCurrentById(b, null, function () {
                    OutlookIntegration.addCurrentAsTask()
                })
            }
        })
    },
    tracked: false,
    trackIfNeeded: function () {
        if (!OutlookIntegration.tracked) {
            _gaq.push(["_trackEvent", "Outlook", "Open", "Plugin"]);
            OutlookIntegration.tracked = true
        }
    }
};
Signals.connect("project_editor.changed", OutlookIntegration.annotateProjectController);

function setOutlookEmail(a) {
    if (isString(a)) {
        a = evalTxt(a)
    }
    OutlookIntegration.setCurrentEmail(a);
    OutlookIntegration.trackIfNeeded()
}

function addOutlookEmail(a) {
    if (isString(a)) {
        a = evalTxt(a)
    }
    OutlookIntegration.setCurrentEmail(a);
    OutlookIntegration.addToProject(a);
    _gaq.push(["_trackEvent", "Outlook", "Open", "addOutlookEmail"])
}

function setMacDockBadge(b) {
    var a, c;
    if (window.fluid) {
        a = window.fluid;
        c = "dockBadge"
    }
    if (window.macgap) {
        a = window.macgap.dock;
        c = "badge"
    }
    if (a && c) {
        if (b <= 0) {
            b = ""
        }
        a[c] = "" + b
    }
}
var CUR_HREF = null;

function sideBarSniffing(a) {
    CUR_HREF = a;
    SideBar.annotateProjectController()
}
try {
    window.addEventListener("message", function (a) {
        var b = a.data;
        if (b && b.indexOf("THUNDERBIRD_MESSAGE") != -1) {
            sideBarSniffing(JSON.parse(b))
        }
        if (b && b.indexOf("T_FIREFOX_MESSAGE") != -1) {
            CUR_HREF = JSON.parse(b);
            SideBar.annotateProjectController()
        }
        if (b && b.indexOf("GMAIL_MESSAGE_ADD") != -1) {
            SideBar.force_quick_add = true;
            CUR_HREF = JSON.parse(b);
            SideBar.addOnClick()
        }
    }, false)
} catch (e) {}

function getCurHref() {
    if (CUR_HREF) {
        return CUR_HREF.href
    }
    return null
}

function isGmailDomain(a) {
    return a.indexOf("mail.google.com") != -1 || a.indexOf("googlemail.com") != -1
}

function isGmailCurHref() {
    var a = getCurHref();
    if (!a) {
        return false
    }
    if (isGmailDomain(a)) {
        var b = SideBar._getGmailRealId(a);
        if (b) {
            return true
        }
    }
    return false
}

function linkRedirecter(g) {
    function a(j) {
        var k = j.match(/th=(.{16})/);
        if (k) {
            return k[1]
        }
        var k = j.match(/\/([^\/\.]{16})/);
        if (k) {
            return k[1]
        }
        return null
    }
    var i = g.getAttribute("thunder_id");
    if (i) {
        var c = JSON.stringify({
            type: "switchEmail",
            id: i
        });
        return top.postMessage(c, "*")
    }
    if (window.CUR_HREF && CUR_HREF.href) {
        var f = a(g.href);
        var d = CUR_HREF.href.match(/^(.+)#/);
        if (isGmailDomain(g.href) && f && d) {
            if (CUR_HREF.type == "T_FIREFOX_MESSAGE") {
                var b = d[1] + "#inbox/" + f;
                var c = JSON.stringify({
                    type: "switchLocation",
                    url: b
                });
                try {
                    top.postMessage(c, "*")
                } catch (h) {}
                return false
            }
            if (CUR_HREF.switchLocation) {
                CUR_HREF.switchLocation(d[1] + "#inbox/" + f);
                return false
            }
            if (top.postMessage) {
                postMessageToWindow(top, "SWITCH_URL:" + g.href)
            } else {
                window.open(d[1] + "#inbox/" + f)
            }
            return false
        }
    }
    return true
}
SideBar = {
    force_quick_add: false,
    _getGmailRealId: function (c) {
        try {
            var a = c.split("/");
            real_id = a[a.length - 1];
            if (real_id.indexOf(".") == -1 && real_id.indexOf("#") == -1 && real_id.indexOf("/") == -1 && real_id.length == 16) {
                return real_id
            }
        } catch (b) {}
        return null
    },
    _stripTitle: function (a) {
        a = a.replace(/\s\s+/g, " ").replace(/"/g, "");
        a = a.replace(/[\[]/g, "(").replace(/[\]]/g, ")");
        return strip(a)
    },
    addOnClick: function () {
        var a = ProjectEditorManager.current_editor;
        if (a && SideBar.force_quick_add == false) {
            a.addNewItem(false, function () {
                var c = $f(ProjectEditorManager.current_form, "ta");
                SideBar.addToTextArea(c)
            })
        } else {
            QuickAddTasks.support_annotation = false;
            if (!QuickAddTasks.shown) {
                QuickAddTasks.toggle();
                var b = b = $gc($("quick_add_task"), "textarea", "text_box");
                if (OutlookIntegration.current_email_obj) {
                    OutlookIntegration.addToTextArea(b)
                } else {
                    SideBar.addToTextArea(b)
                }
            }
        }
        SideBar.force_quick_add = false;
        return false
    },
    addToTextArea: function (g) {
        if (window.CUR_HREF && window.CUR_HREF.unique_id) {
            var j = window.CUR_HREF;
            if (j.unique_id.indexOf("TODOIST_WARN_USER_MESSAGE_NOT_SELECTED") != -1) {
                alert(_("Please select an email first before adding it as a task."));
                return false
            }
            ContentTransformers.type = "thunderbird";
            ContentTransformers.email_id = j.unique_id;
            ContentTransformers.title = j.subject;
            ContentTransformers.annotateWithIcon(g);
            LibEdit.insertAtCursor(g, j.subject.replace(/\n/g, "") + " ");
            return false
        }
        if (!getCurHref()) {
            return false
        }
        var h = SideBar._getGmailRealId(getCurHref());
        if (h) {
            var i = CUR_HREF.title;
            i = i.replace(" - Gmail", "");
            try {
                i = i.split(" - ");
                if (i.length == 3) {
                    var a = checkEmail(strip(i[1]));
                    var c = checkEmail(strip(i[2]));
                    if (a && !c) {
                        i.pop();
                        i.pop()
                    } else {
                        i.pop();
                        i.shift()
                    }
                } else {
                    if (i.length == 2) {
                        if (checkEmail(strip(i[1]))) {
                            i.pop()
                        }
                    } else {
                        if (i.length == 1) {} else {
                            i.pop();
                            i.shift()
                        }
                    }
                }
                i = SideBar._stripTitle(i.join(" - "))
            } catch (f) {}
            var b = "gmail";
            var d = CUR_HREF.title.match(/[^\s><]{1,}@[^\s<>]{3,}/g);
            if (d) {
                b = getLast(d).split("@")[1];
                if (b.indexOf("gmail") != -1) {
                    b = "gmail"
                }
            }
            ContentTransformers.type = "gmail";
            ContentTransformers.email_id = h + "@" + b;
            ContentTransformers.title = i;
            ContentTransformers.annotateWithIcon(g);
            LibEdit.insertAtCursor(g, i + " ")
        } else {
            i = SideBar._stripTitle(CUR_HREF.title);
            if (i.indexOf("(") != -1) {
                i = i.replace("(", "]");
                i = i.replace(")", "]")
            }
            i = getCurHref() + " (" + i + ") ";
            LibEdit.insertAtCursor(g, i)
        } if (g.resize) {
            g.resize()
        }
        return false
    },
    annotateProjectController: function () {
        var b = ProjectEditorManager.current_editor;
        if (window.CUR_HREF && b && b.controller) {
            var a = b.controller;
            var d = $("add_link");
            if (!d || SideBar.controller != a) {
                if (d) {
                    removeElement(d)
                }
                d = A({
                    href: "#",
                    "class": "action",
                    id: "add_link"
                });
                ACN(a, d);
                d.onclick = function () {
                    SideBar.addOnClick();
                    return false
                };
                SideBar.controller = a
            }
            if (window.CUR_HREF.unique_id) {
                RCN(d, null);
                ACN(d, _("Add email as task"));
                addClass(d, "gmail_link")
            }
            var c = getCurHref();
            if (c) {
                var f = isGmailCurHref();
                if (f && !hasClass(d, "gmail_link")) {
                    RCN(d, null);
                    ACN(d, _("Add email as task"));
                    addClass(d, "gmail_link");
                    removeClass(d, "regular_link")
                } else {
                    if (!f && !hasClass(d, "regular_link")) {
                        RCN(d, null);
                        ACN(d, _("Add website as task"));
                        addClass(d, "regular_link");
                        removeClass(d, "gmail_link")
                    }
                }
            }
            OutlookIntegration.annotateProjectController()
        }
        setTimeout(SideBar.annotateProjectController, 500)
    }
};
Signals.connect("project_editor.changed", SideBar.annotateProjectController);
var GContentTransformers, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GContentTransformers = (function () {
    function a() {
        this.onContollerHide = __bind(this.onContollerHide, this);
        this.onContentSave = __bind(this.onContentSave, this)
    }
    a.prototype.type = null;
    a.prototype.email_id = "";
    a.prototype.title = "";
    a.prototype.onContentSave = function (b) {
        if (this.type === "gmail") {
            return "[[gmail=" + this.email_id + ", " + b + " ]]"
        }
        if (this.type === "thunderbird") {
            return "[[thunderbird\n" + b.replace(/\n/g, "") + "\n" + this.email_id.replace(/\n/g, "") + " \n]]"
        }
        if (this.type === "outlook") {
            return "[[outlook=" + this.email_id + ", " + b + " ]]"
        }
        return b
    };
    a.prototype.onContentShow = function (b) {
        return this.title
    };
    a.prototype.onContollerHide = function () {
        this.type = null;
        this.email_id = "";
        return this.title = ""
    };
    a.prototype.setupByContent = function (c) {
        var b;
        if (c.indexOf("[[gmail=") !== -1) {
            b = c.match(/\[\[gmail=(.+?),\s*(.+?)\]\]/);
            if (b) {
                this.email_id = b[1];
                this.title = b[2];
                this.type = "gmail"
            }
        }
        if (c.indexOf("[[thunderbird") !== -1) {
            b = c.match(/\[\[thunderbird\n([^\n]+)\n([^\n]+)\n\]\]/);
            if (b) {
                this.email_id = b[2];
                this.title = b[1];
                this.type = "thunderbird"
            }
        }
        if (c.indexOf("[[outlook=") !== -1) {
            b = c.match(/\[\[outlook=(.+?),\s*(.+?)\]\]/);
            if (b) {
                this.email_id = b[1];
                this.title = b[2];
                return this.type = "outlook"
            }
        }
    };
    a.prototype.annotateWithIcon = function (c, b) {
        var d;
        d = c.parentNode;
        addClass(d, "has_content_icon");
        return ATT(d, imageSprite("cmp_email_on", 16, 16))
    };
    return a
})();
window.ContentTransformers = new GContentTransformers();
var GForcedScroll, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GForcedScroll = (function () {
    var a;

    function b() {
        this.removeListener = __bind(this.removeListener, this);
        this.attachListener = __bind(this.attachListener, this)
    }
    a = -1;
    b.prototype.attachListener = function (h, g, d) {
        var c, f = this;
        if (d == null) {
            d = {}
        }
        c = function (i) {
            f.removeListener();
            f.force_scroll_y = getScrollTop();
            window.disableScroll = function (j) {
                if (h.scrollHeight < h.offsetHeight) {
                    return true
                }
                window.scroll(0, f.force_scroll_y);
                preventDefault(j);
                return false
            };
            return AEV(window, "scroll", window.disableScroll)
        };
        return MouseHover.attach(h, g, c, this.removeListener, d)
    };
    b.prototype.removeListener = function () {
        if (window.disableScroll) {
            REV(window, "scroll", window.disableScroll);
            return window.disableScroll = null
        }
    };
    return b
})();
window.ForcedScroll = new GForcedScroll();
LibEdit = {
    placeCursor: function (c, b) {
        if (AJS.isIe()) {
            var a = c.createTextRange();
            a.collapse(true);
            a.move("character", b);
            a.select()
        } else {
            if (c.selectionStart || c.selectionStart == "0") {
                c.selectionStart = b;
                c.selectionEnd = b
            }
        }
        setTimeout(function () {
            c.focus()
        }, 30)
    },
    getCursorPosition: function (g) {
        try {
            if (g.selectionStart) {
                return g.selectionStart
            } else {
                if (!document.selection) {
                    return 0
                }
            }
            var h = "\001";
            var d = document.selection.createRange();
            var b = d.duplicate();
            var a = 0;
            b.moveToElementText(g);
            d.text = h;
            a = (b.text.indexOf(h));
            d.moveStart("character", -1);
            d.text = "";
            if (a == -1) {
                a = g.value.length
            }
            return a
        } catch (f) {
            return g.value.length
        }
    },
    insertAtCursor: function (l, f, c) {
        var g = f.indexOf("~`");
        if (g == -1) {
            g = f.length
        }
        f = f.replace("~`", "");
        if (document.selection) {
            if (DummyText.isEmpty(l)) {
                removeClass(l, "dummy_text");
                l.value = "";
                l._word = ""
            }
            l.focus();
            var b = document.selection.createRange();
            var i = b.text;
            b.text = f;
            var k = f.length - g;
            b.moveStart("character", -k);
            b.moveEnd("character", -k);
            b.select();
            if (c) {
                LibEdit.insertAtCursor(l, i)
            }
        } else {
            if (l.selectionStart || l.selectionStart == "0") {
                l.focus();
                var j = l.scrollTop;
                var h = l.selectionStart;
                var a = l.selectionEnd;
                var i = l.value.substring(h, a);
                g += h;
                l.value = l.value.substring(0, h) + f + l.value.substring(a, l.value.length);
                l.selectionStart = g;
                l.selectionEnd = g;
                l.scrollTop = j;
                if (c) {
                    LibEdit.insertAtCursor(l, i)
                }
            } else {
                l.value += f
            }
        } if (l.resize_textarea) {
            l.resize_textarea(l)
        }
    }
};
Sortable = Class({
    current_replacer: null,
    init: function (a, b) {
        this.li_items = a;
        this.controller = b;
        this.set_indent = true;
        bindMethods(this)
    },
    onStart: function () {
        var a = AJS.dnd.current_root;
        var d = a.offsetWidth;
        if (window.IS_MINI) {
            var f = a.offsetTop;
            var g = absolutePosition(a).x
        } else {
            var i = absolutePosition(a);
            var f = i.y;
            var g = i.x
        }
        var b = this.current_replacer = LI();
        AJS.dnd.current_replacer = b;
        this.cur_child = GenericManagerUtils.getChildren(a);
        this.cur_child = this.cur_child || [];
        AJS.dnd.cur_child = this.cur_child;
        map(this.cur_child, function (h) {
            hideElement(h)
        });
        setClass(b, a.className);
        addClass(b, "drop_item");
        addClass(a, "on_drag");
        var c = 1;
        if (isIe()) {
            c = 0
        }
        setHeight(b, a.offsetHeight - c);
        if (!hasClass(a, "task_item")) {
            d -= 10
        }
        setWidth(a, d);
        setOpacity(a, 0.7);
        setTimeout(function () {
            setTop(a, f);
            var h = parseInt(getStyle(a, "marginLeft"));
            if (hasClass(getBody(), "full_width") && hasClass(a, "task_item")) {
                setLeft(a, 20)
            } else {
                setLeft(a, g - h)
            }
            a.style.position = "absolute";
            insertAfter(b, a)
        }, 1)
    },
    onDrag: function () {
        var b = AJS.dnd.current_root;
        var c = this.current_replacer;
        var a = this.controller;
        map(this.li_items, function (g) {
            if (g != b) {
                var h = g.offsetTop + 64;
                if (window.IS_MINI) {
                    h = g.offsetTop - 35
                }
                var d = h + (g.offsetHeight / 2);
                var f = b.offsetTop;
                if (window.IS_MINI) {
                    f -= 35
                }
                var i = f + b.offsetHeight;
                if (i > d && f < h) {
                    while (g.nextSibling && g.nextSibling.style.display == "none") {
                        g = g.nextSibling
                    }
                    insertAfter(c, g)
                } else {
                    if (f < d && f > h) {
                        insertBefore(c, g)
                    }
                }
            }
        })
    },
    onEnd: function (c) {
        var a = AJS.dnd.current_root;
        var b = this.current_replacer;
        removeClass(a, "on_drag");
        setOpacity(a, 1);
        a.style.position = "";
        a.style.left = "";
        a.style.width = "";
        if (this.set_indent) {
            GenericManagerUtils.setIndent(a, a.json.indent)
        }
        insertBefore(a, b);
        removeElement(b);
        AJS.dnd.removeDragAble(a);
        this.current_replacer = null;
        AJS.dnd.current_replacer = null;
        if (!this.cur_child) {
            return
        }
        rmap(this.cur_child, function (d) {
            insertAfter(d, a)
        });
        GenericManagerUtils.showChildren(this.cur_child, a);
        AJS.dnd.cur_child = this.cur_child = null;
        return false
    }
});

function forceLiveRendering(a, b) {
    a(b.shift());
    if (b.length > 0) {
        window.setTimeout(AJS.partial(forceLiveRendering, a, b), 5)
    }
}

function attachKeyDown(a, b) {
    if (isIe() || isSafari(true)) {
        AEV(a, "keydown", b)
    } else {
        if (isCamino()) {
            AEV(a, "keyup", b)
        } else {
            AEV(a, "keypress", b)
        }
    }
}
var T_TIMEOUTS = {};

function delayAjaxUpdate(d, a, b) {
    var c = T_TIMEOUTS[d];
    if (c) {
        clearTimeout(c)
    }
    T_TIMEOUTS[d] = setTimeout(b, a)
}

function postMessageToWindow(c, a) {
    try {
        c.postMessage(a, "*")
    } catch (b) {}
}

function checkEmail(a) {
    return a.indexOf("@") != -1 && a.indexOf(".") != -1
}

function menuSaveItem(a, b) {
    return function () {
        var c = a.current_form;
        if (c && $f(c, "ta").value != "") {
            if (a.current_mode == "edit") {
                a.saveItem(c, function () {
                    return a.showAddItem(true, b)
                })
            } else {
                a.addItem(c, function () {
                    return a.showAddItem(true, b)
                })
            }
        } else {
            return a.showAddItem(true, b)
        }
    }
}

function hoverOn(a) {
    addClass(a, "hovering")
}

function hoverOff(a) {
    removeClass(a, "hovering")
}

function hoverAttach(a) {
    AEV(a, "mouseover", $p(hoverOn, a));
    AEV(a, "mouseout", $p(hoverOff, a))
}

function createColor(b, c) {
    var d = UL({
        "class": "menu_buttons colors"
    });
    var a = LI({
        "class": "colors"
    });
    map(b, function (f, g) {
        var h = A();
        h.style.backgroundColor = f;
        h.onclick = $p(c, g, h, null);
        hoverAttach(h);
        ACN(a, h)
    });
    ACN(d, a);
    return {
        type: "item",
        view: d,
        extra_class: "no_hover"
    }
}

function createPriorities(b) {
    var c = UL({
        "class": "menu_buttons priorities"
    });
    ACN(c, LI({
        "class": "lbl"
    }, _("Priority:")));
    var a = LI({
        "class": "priorities"
    });
    map([4, 3, 2, 1], function (h, f) {
        var d = imageSprite("cmp_priority" + h, 20, 16);
        var g = A({
            c: "a_priority"
        }, d);
        AEV(g, "click", function (i) {
            preventDefault(i);
            b(f + 1, g);
            return false
        });
        hoverAttach(g);
        ACN(a, g)
    });
    ACN(c, a);
    return {
        type: "item",
        view: c,
        extra_class: "no_hover"
    }
}

function selectPriority(c, a) {
    var b = $bytc("li", "priorities", c.menu_holder)[0];
    resetPriorities();
    map($FA(b.childNodes), function (f, d) {
        if (d + 1 == a) {
            addClass(f, "pri_selected")
        }
    })
}

function selectColor(b, c) {
    var a = $bytc("li", "colors", b.colors.view)[0];
    map($FA(a.childNodes), function (f, d) {
        if (d == c) {
            addClass(f, "selected_color")
        } else {
            setHTML(f, "");
            removeClass(f, "selected_color")
        }
    })
}

function resetPriorities() {
    map($bytc("a", "a_priority"), function (a) {
        removeClass(a, "pri_selected");
        removeClass(a, "hovering")
    })
}

function getCurrentMenuController() {
    var b, c, d;
    var a = ProjectEditorManager.current_editor;
    if (a) {
        b = a;
        d = EditorMenu
    } else {
        b = Agenda;
        d = AgendaEditMenu
    }
    b.setCurrentItem();
    return [b, d]
}
Signals.connect("hide_all_menus", function () {
    EditorMenu.hide(null, true);
    ProjectList.menu.hide(null, true);
    AgendaEditMenu.hide(null, true);
    AgendaQueryMenu.hide(null, true)
});

function generateProjectListMenu(a) {
    var b;
    ProjectMenu = new AmiMenu();
    ProjectMenu.addItems(createItem(_("Add project above"), menuSaveItem(a, true), {
        extra_class: "project_archive_action project_inbox_action"
    }), createItem(_("Add project below"), menuSaveItem(a, false), {
        extra_class: "project_archive_action"
    }), createSeparator("project_archive_action"), createItem(_("Edit project"), $p(a.saveCurrentItem, a.editCurrentItem), {
        extra_class: "project_archive_action project_inbox_action"
    }), createItem(SPAN({
        id: "menu_archive_text"
    }, _("Archive project")), function () {
        return ProjectsArchive.toggleArchive()
    }, {
        extra_class: "project_inbox_action"
    }), createSeparator("project_archive_action project_inbox_action"), ProjectMenu.colors = createColor(ProjectColors, a.setColor), createSeparator("project_inbox_action"), b = createItem(_("Email tasks to this project"), function () {
        a.withCurrentItem(function (c) {
            return ProjectExtraOptions.showEmails(c.json.id)
        })
    }), createSeparator("project_inbox_action"), createItem(_("Delete project"), a.deleteCurrentItem, {
        extra_class: "project_inbox_action"
    }));
    addClass(ProjectMenu.colors.view.parentNode.parentNode, "project_inbox_action");
    if (window.NATIVE_APP == "mac_store" && !window.IsPremium) {
        hideElement(b.view.parentNode)
    }
    ProjectMenu.hide_menu_icon = true;
    AEV(document, "click", ProjectMenu.hide);
    return ProjectMenu
}

function generateProjectEditorMenu() {
    EditorMenu = new AmiMenu();
    EditorMenu.addItems(createItem(_("Add task above"), function (a) {
        return menuSaveItem(ProjectEditorManager.current_editor, true)(a)
    }), createItem(_("Add task below"), function (a) {
        menuSaveItem(ProjectEditorManager.current_editor, false)(a)
    }), createSeparator(), createItem(_("Postpone"), Postpone.postPoneFromMenuItem), createItem(_("Do it Today"), DoItToday.changeToTodayMenu), createSeparator(), createItem(_("Edit task"), function () {
        var a = ProjectEditorManager.current_editor;
        return a.saveCurrentItem(a.editCurrentItem)
    }), createSeparator(), createPriorities(function (a) {
        ProjectEditorManager.current_editor.updatePriority(a)
    }));
    if (window.IsPremium || window.NATIVE_APP != "mac_store") {
        EditorMenu.addItems(createSeparator(), createItem(_("Reminders"), function () {
            var a = ProjectEditorManager.current_editor;
            a.withCurrentItem(function (b) {
                Reminders.show(b)
            });
            return false
        }))
    }
    EditorMenu.addItems(createSeparator(), createItem(_("Move to history"), function (a) {
        ProjectEditorManager.current_editor.forceComplete(a)
    }), createItem(_("Move to another project"), function (a) {
        ProjectEditorManager.current_editor.showMoveTo(a)
    }), createItem(_("Delete task"), function (a) {
        ProjectEditorManager.current_editor.deleteCurrentItem(a)
    }));
    EditorMenu.hide_menu_icon = true;
    AEV(document, "click", EditorMenu.hide);
    return EditorMenu
}

function generateProjectGearMenu() {
    var f, a, d;
    ProjectGearMenu = new AmiMenu();
    var c, b;
    ProjectGearMenu.addItems(b = createItem(_("Share Project"), function () {
        SharingManager.show(ProjectEditorManager.current_project_id);
        ProjectGearMenu.hide(null, true);
        return false
    }, {
        extra_class: "menu_item_share"
    }), c = createSeparator("menu_item_share"), createItem(_("Sort by date"), ItemsSortBy.sortByDate), createItem(_("Sort by priority"), ItemsSortBy.sortByPriority), createItem(_("Sort by name"), ItemsSortBy.sortByName), createSeparator(), f = createItem(_("Email tasks to this project"), function () {
        return ProjectExtraOptions.showEmails(ProjectEditorManager.current_project_id)
    }), createSeparator(), a = createItem(_("Export as a template"), function () {
        return ProjectExtraOptions.exportAsTemplate(ProjectEditorManager.current_project_id)
    }), d = createItem(_("Import from template"), function () {
        return ProjectExtraOptions.showImportTemplate(ProjectEditorManager.current_project_id)
    }), createSeparator(), createItem(_("Delete completed tasks"), function () {
        return ProjectEditorManager.current_editor.clearCompletedTasks()
    }));
    if (User.beta != 2) {
        hideElement($bytc("tr", "menu_item_share"))
    }
    if (window.NATIVE_APP == "mac_store" && !window.IsPremium) {
        hideElement(f.view.parentNode);
        hideElement(a.view.parentNode);
        hideElement(d.view.parentNode)
    }
    AEV(document, "click", ProjectGearMenu.hide);
    return ProjectGearMenu
}

function generateAgendaEditMenu(a) {
    AgendaEditMenu = new AmiMenu();
    AgendaEditMenu.addItems(createItem(_("Postpone"), Postpone.postPoneFromMenuItem), createItem(_("Do it Today"), DoItToday.changeToTodayMenu), createSeparator(), createItem(_("Edit task"), a.editCurrentItem), createSeparator(), createPriorities(a.updatePriority));
    if (window.IsPremium || window.NATIVE_APP != "mac_store") {
        AgendaEditMenu.addItems(createSeparator(), createItem(_("Reminders"), function () {
            Agenda.withCurrentItem(function (b) {
                Reminders.show(b)
            });
            return false
        }))
    }
    AgendaEditMenu.addItems(createSeparator(), createItem(_("Move to history"), a.forceComplete), createItem(_("Move to another project"), a.showMoveTo), createItem(_("Delete task"), a.deleteCurrentItem));
    AgendaEditMenu.hide_menu_icon = true;
    AEV(document, "click", AgendaEditMenu.hide);
    return AgendaEditMenu
}
PrioCount1 = SPAN(" (0)");
PrioCount2 = SPAN(" (0)");
PrioCount3 = SPAN(" (0)");
StartPageItem = null;

function generateAgendaQueryMenu(a) {
    AgendaQueryMenu = new AmiMenu();
    AgendaQueryMenu.addItems(createItem(_("View all projects"), $p(a.query, "view all")), createSeparator(), StartPageItem = createItem(_("Start page") + " <small>[" + getStartPage() + "]</small>", showStartPage), createSeparator(), createItem(SPAN(_("Priority 1 tasks") + " ", PrioCount1), $p(a.query, "priority 1")), createItem(SPAN(_("Priority 2 tasks") + " ", PrioCount2), $p(a.query, "priority 2")), createItem(SPAN(_("Priority 3 tasks") + " ", PrioCount3), $p(a.query, "priority 3")), createSeparator(), createItem(_("Tasks with no due date"), $p(a.query, "no date")), createSeparator(), createItem(CENTER(imageSprite("cmp_info_on", 16, 16), _("Help and Reference")), showQuerySyntax));
    AEV(document, "click", AgendaQueryMenu.hide)
}

function showQuerySyntax() {
    AgendaQueryMenu.hide(null, true);
    return GB_show(_("Filter tasks..."), AJS.BASE_URL + "Help/timeQuery", 450, 600)
}

function generateUserMenu() {
    UserMenu = new AmiMenu();
    UserMenu.addItems(createItem(_("Settings"), function () {
        return GB_show(_("Todoist Settings"), "/Users/viewPrefs", 550, 750)
    }), createItem(_("Todoist Premium"), function () {
        return WindowOpener.showPrefs("premium")
    }), createSeparator(), createItem(_("Print current page"), openInPrintMode), createSeparator(), createItem(_("Keyboard shortcuts"), WindowOpener.showKeyboardShortcuts), createSeparator(), createItem(_("Logout"), function () {
        var a = "/Users/logout";
        if (isHttps()) {
            a += "?ssl=1"
        }
        LoginEngine.logout();
        LoadEngine.clearLocalData();
        window.location = a
    }));
    AEV(document, "click", UserMenu.hide)
}
AEV(window, "load", generateUserMenu);
window.generatePriorityMenu = function () {
    var a;
    window.PriorityMenu = a = new AmiMenu();
    addClass(a.menu_holder, "priority_menu");
    a.addItems(createPriorities(function (b) {
        Signals.sendSignal("menu_priority_changed", b);
        return false
    }));
    AEV(document, "click", a.hide);
    return a
};
window.generateMenuProjectColors = function () {
    var a;
    window.MenuProjectColors = a = new AmiMenu();
    a.addItems(a.colors = createColor(ProjectColors, function (b) {
        Signals.sendSignal("project_color_selected", b);
        a.hide(true, null);
        return false
    }));
    AEV(document, "click", a.hide);
    return a
};
Loading = {
    show: function () {
        var b = this.loading = $("loading");
        var a = getWindowSize();
        setHeight(b, a.h - 40)
    },
    hide: function () {
        if (this.loading) {
            removeElement(this.loading);
            this.loading = null
        }
    }
};
var InfoPage = {
    showLabels: function () {
        return GB_show(_("Labels"), "/Help/viewLabels", 500, 720)
    },
    showReminders: function () {
        return GB_show(_("Reminders in Todoist"), "/Help/viewReminders", 500, 720)
    },
    showDateInsert: function () {
        MiniCal.remove();
        return GB_show(_("Inserting dates and times in Todoist"), "/Help/timeInsert", 500, 680)
    },
    showFilters: function () {
        return GB_show(_("Filtering tasks"), "/Help/filters", 450, 600)
    },
    showKeyboardShortcuts: function () {
        return GB_show(_("Keyboard shortcuts"), "/Help/viewKeyboardShortcuts", 480, 650)
    },
    showFormatting: function () {
        return GB_show(_("Formatting text"), "/Help/viewFormatting", 480, 650)
    },
    showNotes: function () {
        return GB_show(_("Notes and file attachments"), "/Help/viewTaskNotes", 550, 650)
    },
    loadShouldShowPromotion: function () {
        if ($storage("hide_info_promotion").get() == true) {
            return
        }
        var a = getRequest("/InfoPage/showPromotion");
        a.offline_message = true;
        a.addCallback(function (b) {
            b = parseInt(b);
            if (b) {
                var c = true
            } else {
                var c = false
            }
            InfoPage.should_show_promotion = c;
            if (!c) {
                $storage("hide_info_promotion").set(true)
            }
        });
        a.sendReq({})
    },
    checkPromotion: function () {
        if (window.IS_MINI) {
            return
        }
        if ($storage("hide_info_promotion").get() == true) {
            return
        }
        var a = getRequest("/InfoPage/showPromotion");
        a.offline_message = true;
        a.addCallback(function (b) {
            b = parseInt(b);
            if (b == 1) {
                InfoPage._showPromotion()
            }
            getRequest("/Tooltips/markAsSeen").sendReq({
                name: "info_page"
            });
            $storage("hide_info_promotion").set(true)
        });
        a.sendReq({})
    },
    _showPromotion: function () {
        if (!$("blank_state_info_page")) {
            var a;
            var b = DIV({
                id: "blank_state_info_page"
            }, IMG({
                src: "https://d3ptyyxy2at9ui.cloudfront.net/36a501f38ca513ca56efc94185fd8a02.png",
                c: "blank_arrow"
            }), DIV({
                c: "blank_state_text"
            }, imageSprite("cmp_blank_star", 48, 48, "blank_state_image"), B(_("Become a Todoist master")), DIV(_("Learn how you can use Todoist to become more productive and"), " ", _("install our amazing plugins for Android, iPhone, Google Chrome, Outlook...")), DIV({
                s: "text-align: right"
            }, a = A({
                href: "#",
                c: "action"
            }, _("Hide")))));
            AJS.fx.fadeIn(b);
            ACN(getBody(), b);
            AEV(a, "click", InfoPage.removePromotion)
        }
    },
    removePromotion: function () {
        var a = $("blank_state_info_page");
        if (a) {
            removeElement(a)
        }
        return false
    },
    showIfPossible: function () {
        var a = $("info_page");
        if (a) {
            InfoPage.toggle()
        } else {
            Agenda.query("tod, od", false)
        }
    },
    toggle: function (a) {
        var b = $("info_page");
        if (!hasClass(b, "on_info") || a == true) {
            setClass(b, "cmp_info_on on_info icon fixed_pos");
            LocationManager.updateLocation("info_page");
            Indicator.show();
            var c = getRequest("InfoPage/show");
            c.offline_message = true;
            c.addCallback(InfoPage.show);
            c.addErrback(function () {
                setClass(b, "cmp_info_on icon fixed_pos");
                Indicator.remove()
            });
            c.sendReq()
        } else {
            InfoPage.hide()
        }
        return false
    },
    render: function (b) {
        var c = $("editor");
        var a = DIV({
            id: "info_container"
        });
        setHTML(a, b);
        evalScriptTags(b);
        InfoPage.container = a;
        ACN(getBody(), a);
        InfoPage._place();
        AEV(window, "resize", InfoPage._place)
    },
    hide: function () {
        if (InfoPage.container) {
            var a = $("editor");
            var c = $("info_page");
            setClass(c, "cmp_info_on icon");
            $("content").style.height = "";
            hideElement(InfoPage.container);
            try {
                map(a.childNodes, function (d) {
                    showElement(d)
                })
            } catch (b) {}
        }
    },
    show: function (a) {
        Indicator.remove();
        InfoPage.removePromotion();
        removeElement($("blank_state_project_editor"));
        var b = $("editor");
        if (!InfoPage.container) {
            InfoPage.render(a)
        }
        showElement(InfoPage.container);
        try {
            map(b.childNodes, function (d) {
                hideElement(d)
            })
        } catch (c) {}
        setHeight($("content"), InfoPage.container.offsetHeight)
    },
    setHeight: function () {
        setHeight($("content"), InfoPage.container.offsetHeight)
    },
    _place: function () {
        var c = $("editor");
        var b = $("info_container");
        var a = absolutePosition(c);
        setTop(b, a.y - 4);
        setLeft(b, a.x);
        setWidth(b, c.offsetWidth)
    }
};
MoveItems = {
    init: function () {},
    populateData: function (a) {
        var b = UL({
            "class": "items"
        });
        ProjectList.current_list = b;
        ProjectList.arrows.list.current_list = b;
        ACN($("move_view"), b);
        map(a, function (h, g) {
            var d = ProjectList.renderItem(h);
            var c = isBulletItem(h.name);
            var f = false;
            ACN(b, d);
            if (!c && !f) {
                d.onclick = $p(MoveItems.onClick, d, h.id);
                d.onmouseover = MoveItems.onMouseOver;
                d.onmouseout = MoveItems.onMouseOut
            } else {
                if (!c && f) {
                    addClass(d, "current")
                }
            }
        });
        GenericManagerUtils.showChildren($FA(b.childNodes));
        ProjectList.checkEmpty();
        map($bytc("td", "menu", b), function (c) {
            removeElement(c)
        });
        ProjectList.arrows.updateArrows()
    },
    onClick: function (a, b) {},
    doMoveItemsRequest: function (a, b) {
        actionPerfomed();
        setTimeout(function () {
            ItemsModel.moveMultiple(a, b);
            var c = keys(a);
            c.push(b);
            Signals.sendSignal("projects.rerender", c)
        }, 25)
    },
    onMouseOver: function (a) {
        var b = AJS.getEventElm(a);
        if (nodeName(b) != "li") {
            b = getParentBytc(b, "li")
        }
        if (hasClass(b, "current")) {
            return
        }
        AJS.addClass(b, "hover")
    },
    onMouseOut: function (a) {
        var b = AJS.getEventElm(a);
        if (nodeName(b) != "li") {
            b = getParentBytc(b, "li")
        }
        if (hasClass(b, "current")) {
            return
        }
        removeClass(b, "hover")
    },
    showOverlay: function (a) {
        if (!a) {
            a = {}
        }
        if (!a.header) {
            a.header = _("Move to another project")
        }
        if (!a.cancel_text) {
            a.cancel_text = _("Cancel move")
        }
        MoveItems.selected_project = null;
        var b;
        GB_showHTML(a.header, DIV(DIV({
            id: "move_view",
            s: "padding: 5px 10px 5px 10px; width: 210px"
        }), BR(), b = INPUT({
            type: "button",
            value: a.cancel_text
        })), 500, 235);
        b.onclick = GB_hide;
        MoveItems.init();
        MoveItems.onClick = function (c, d, f) {
            var g = getEventElm(f);
            if (nodeName(g) != "img" && !g.is_menu_icon) {
                MoveItems.selected_project = d;
                GB_hide()
            }
        };
        MoveItems.populateData(ProjectsModel.getAll())
    },
    resetProjectList: function () {
        ProjectList.current_list = $("project_list");
        ProjectList.arrows.list.current_list = ProjectList.current_list
    }
};
var GSharingManager, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GSharingManager = (function () {
    function a() {
        this._checkEmpty = __bind(this._checkEmpty, this);
        this._renderAdder = __bind(this._renderAdder, this);
        this._renderHolder = __bind(this._renderHolder, this);
        this._renderData = __bind(this._renderData, this);
        this.renderData = __bind(this.renderData, this);
        this._show = __bind(this._show, this);
        this.show = __bind(this.show, this)
    }
    a.prototype.show = function (c) {
        var b, d = this;
        setEditOn();
        b = this._renderHolder();
        ACN(b, Indicator.imgSmall());
        GB_showHTML(_("Share project with others"), b, 400, 300, {
            callback_fn: function () {
                return setEditOff()
            }
        });
        if (TemporaryIds.isTemporary(c)) {
            TemporaryIds.listen(c, function (g, f) {
                return d._show(f)
            })
        } else {
            this._show(c)
        }
        return false
    };
    a.prototype._show = function (b) {
        var c;
        c = ProjectsModel.get(b);
        if (c.inbox_project) {
            alert(_("It's not possible to share the inbox project. Please share a regular project."), GB_hide);
            return false
        }
        this.current_project = c;
        return SharingModel.getSharedProject(c.id, this.renderData)
    };
    a.prototype.renderData = function (b) {
        this.doing_request = false;
        RCN(this.holder, null);
        ACN(this.holder, this._renderAdder());
        ACN(this.holder, this.view_data = this._renderData(b));
        this._checkEmpty(b);
        if (!isIe()) {
            return this.adder_input.focus()
        }
    };
    a.prototype._renderData = function (n) {
        var l, g, q, k, j, i, f, p, c, b, m, h, d, o = this;
        if (n === "PROJECT_NOT_FOUND") {
            n = {
                owner_user_id: window.User.id,
                collaborators: []
            }
        }
        g = function (t) {
            var v, s, x, u, r, w;
            v = null;
            x = t.full_name || t.user_full_name;
            if (x) {
                w = SPAN({
                    c: "name"
                }, DIV({
                    c: "content"
                }, s = B(x), BR(), t.email))
            } else {
                w = SPAN(DIV({
                    c: "content"
                }, s = B(t.email)))
            } if (t.avatar_small) {
                v = Avatars.renderAvatar(t, "small");
                ATT(w, v);
                addClass(w, "has_avatar")
            }
            u = t.state === "pending";
            if (u) {
                ACN(s, SPAN({
                    c: "status pending"
                }, _("Pending")))
            }
            if (n.owner_user_id === t.id) {
                ACN(s, SPAN({
                    c: "status owner"
                }, _("Owner")))
            }
            if (u || n.user_role === "owner" && n.owner_user_id !== t.id) {
                ATT(w, r = A({
                    href: "#",
                    c: "delete"
                }, imageSprite("cmp_trash_small", 12, 12)));
                AEV(r, "click", function () {
                    var y;
                    y = _('Are you sure you want to remove "%s"?');
                    y = y.replace("%s", x || t.email);
                    Alerts.confirm(y, function (C) {
                        var z;
                        if (!C) {
                            return
                        }
                        RCN(r, Indicator.imgSmall());
                        z = function () {
                            removeElement(w.parentNode);
                            return o._checkEmpty(n)
                        };
                        return SharingModel.deleteFromProject(o.current_project.id, [t.email], z)
                    });
                    return false
                })
            }
            return DIV({
                c: "user_info"
            }, w)
        };
        q = DIV();
        l = n.owner_user_id;
        m = n.collaborators;
        for (j = 0, p = m.length; j < p; j++) {
            k = m[j];
            if (k.id === l) {
                ACN(q, g(k))
            }
        }
        if (n.invitations) {
            h = n.invitations;
            for (i = 0, c = h.length; i < c; i++) {
                k = h[i];
                if (k.state === "pending") {
                    ACN(q, g(k))
                }
            }
        }
        if (n.collaborators) {
            d = n.collaborators;
            for (f = 0, b = d.length; f < b; f++) {
                k = d[f];
                if (k.id !== l) {
                    ACN(q, g(k))
                }
            }
        }
        return q
    };
    a.prototype._renderHolder = function () {
        this.holder = DIV({
            c: "sharing_manager"
        });
        return this.holder
    };
    a.prototype._renderAdder = function () {
        var b, d, c = this;
        if (this.doing_request) {
            return false
        }
        b = AmiButton.createButton(_("Invite Person"));
        addClass(b, "amibutton_red");
        this.adder = DIV({
            c: "sharing_adder"
        }, this.adder_input = INPUT({
            type: "text",
            placeholder: _("Email"),
            c: "input_email text_box"
        }), b);
        d = function () {
            var g, f;
            c.doing_request = true;
            f = c.adder_input.value;
            if (f.indexOf("@") === -1) {
                alert(_("Email isn't valid"));
                return false
            }
            c.adder_input.disabled = true;
            RCN(b, Indicator.imgSmall());
            g = function () {
                return SharingModel.getSharedProject(c.current_project.id, c.renderData)
            };
            SharingModel.shareProject(c.current_project.id, [f], g);
            return false
        };
        AEV(b, "click", d);
        AEV(this.adder_input, "keydown", function (f) {
            if (f.key === 13) {
                return d()
            }
            return true
        });
        return this.adder
    };
    a.prototype._checkEmpty = function (g) {
        var d, b, c, f;
        f = $bytc("div", "user_info", this.holder);
        if (f.length <= 1) {
            removeElement(f);
            d = _("The people you invite will be able to add, delete and complete tasks from '%s'.").replace("%s", this.current_project.name);
            b = _("You will get notified when changes happen.");
            return ACN(this.holder, this.view_data = DIV({
                c: "blank_screen"
            }, H2(_("Collaborate with others")), d, BR(), BR(), b))
        } else {
            if (!$gc(this.holder, "div", "desc")) {
                c = null;
                if (g.user_role !== "owner") {
                    c = A({
                        href: "#"
                    }, _("Leave this project"));
                    AEV(c, "click", function () {
                        var h = this;
                        Alerts.confirm(_("Are you sure you want to leave this project?"), function (i) {
                            if (i) {
                                SharingModel.deleteFromProject(g.project_id, [User.email]);
                                return false
                            }
                        });
                        return false
                    })
                }
                return ACN(this.holder, DIV({
                    c: "desc"
                }, _("Only the owner can remove people from the project."), BR(), c))
            }
        }
    };
    return a
})();
window.SharingManager = new GSharingManager();
var GSharingModel;
GSharingModel = (function () {
    function a() {}
    a.prototype.getSharedProject = function (b, f) {
        var d, c;
        c = loadJSON("/API/Sharing/getSharedProject");
        c.addCallback(f);
        d = {
            token: User.token,
            project_id: b
        };
        return c.sendReq(d)
    };
    a.prototype.shareProject = function (c, b, h, f) {
        var g, d;
        if (f == null) {
            f = null
        }
        d = loadJSON("/API/Sharing/shareProject");
        d.addCallback(h);
        g = {
            token: User.token,
            project_id: c,
            email_list: serializeJSON(b)
        };
        if (f) {
            g.message = f
        }
        return d.sendReq(g)
    };
    a.prototype.deleteFromProject = function (c, b, g) {
        var f, d;
        d = loadJSON("/API/Sharing/deleteFromProject");
        if (g) {
            d.addCallback(g)
        }
        f = {
            token: User.token,
            project_id: c,
            email_list: serializeJSON(b)
        };
        return d.sendReq(f)
    };
    return a
})();
window.SharingModel = new GSharingModel();
var GNotifications, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GNotifications = (function () {
    function a() {
        this.hideIndicator = __bind(this.hideIndicator, this);
        this.showIndicator = __bind(this.showIndicator, this);
        this.renderNotification = __bind(this.renderNotification, this);
        this.renderNotifications = __bind(this.renderNotifications, this);
        this.fetchData = __bind(this.fetchData, this);
        this.showDropdown = __bind(this.showDropdown, this);
        this.updateIcon = __bind(this.updateIcon, this)
    }
    a.prototype.renderIcon = function () {
        var b, c = this;
        if (window.User.beta !== 2) {
            return null
        }
        b = SPAN({
            id: "notifications_counter"
        }, "•");
        AEV(b, "click", function () {
            c.updateIcon(0);
            return c.showDropdown(b)
        });
        return b
    };
    a.prototype.updateIcon = function (c) {
        var b, d = this;
        b = $("notifications_counter");
        if (!b || this.cur_window) {
            return this.timeout = setTimeout(function () {
                d.timeout = null;
                return d.updateIcon(c)
            }, 500)
        }
        if (c > 0) {
            setHTML(b, "" + c);
            return addClass(b, "unread_n")
        } else {
            setHTML(b, "0");
            return removeClass(b, "unread_n")
        }
    };
    a.prototype.showDropdown = function (c) {
        var b, d, f = this;
        this.offset = null;
        d = {
            fn_left_offset: function (i, h) {
                var g;
                g = absolutePosition(c).x;
                return g - 180
            },
            fn_top_offset: function () {
                var g;
                g = absolutePosition(c).y;
                return g + 27
            },
            fn_arrow_left: function () {
                var g;
                g = absolutePosition(c).x;
                return g + 5
            },
            fn_on_hide: function () {
                f.cur_window = null;
                return ForcedScroll.removeListener()
            }
        };
        if (window.IS_MINI) {
            d.fixed_pos = true
        }
        b = DIV({
            id: "notifications_holder"
        }, DIV({
            c: "indicator"
        }, Indicator.imgMedium()));
        ForcedScroll.attachListener(b, "notifications");
        AEV(b, "scroll", function (j) {
            var k, i, h, g;
            i = $("more_button_noti");
            if (i) {
                g = getScrollTop(b);
                h = b.scrollHeight;
                k = h - g - 50;
                if (k <= b.offsetHeight) {
                    return i.clickfn(j)
                }
            }
        });
        this.cur_window = TooptipWin.show(_("Notifications"), b, 200, 310, d);
        return this.fetchData(b, null, true)
    };
    a.prototype.fetchData = function (d, g, c) {
        var b, f = this;
        if (c == null) {
            c = false
        }
        if (this.doing_reuqest) {
            return
        }
        this.doing_reuqest = true;
        g = function (i) {
            var h;
            f.doing_reuqest = false;
            if (c && i.notifications.length === 0) {
                return RCN(d, CENTER(DIV({
                    c: "empty"
                }, _("Notifications will be displayed here whenever something happens in one of your shared projects."))))
            } else {
                Collaborators.loadData(i.users);
                h = i.notifications;
                f.renderNotifications(d, h);
                return f.offset = getLast(h).item_key
            }
        };
        b = function (h) {
            return f.doing_reuqest = false
        };
        return NotificationsModel.getNotifications(g, b, this.offset)
    };
    a.prototype.renderNotifications = function (f, d) {
        var g, c, h, i, b, j = this;
        removeElement($bytc("div", "indicator", f));
        if ($("more_button_noti")) {
            removeElement($("more_button_noti"))
        }
        h = UL();
        for (i = 0, b = d.length; i < b; i++) {
            c = d[i];
            ACN(h, this.renderNotification(c))
        }
        if (d.length >= 5) {
            g = AmiButton.createBigButton(SPAN(_("Get more")), null, "more");
            g.id = "more_button_noti";
            ACN(h, g);
            g.clickfn = function () {
                var k;
                k = function () {
                    return RCN(g, Indicator.imgSmall())
                };
                return j.fetchData(f, k)
            };
            AEV(g, "click", g.clickfn);
            this.offset = getLast(d).item_key
        }
        return ACN(f, h)
    };
    a.prototype.renderNotification = function (c) {
        var d, g, l, b, m, r, i, p, o, n, s, k, q, f, j, h = this;
        f = Collaborators.getUserById(c.from_user);
        if (!f) {
            return
        }
        l = Avatars.renderAvatar(f, "medium");
        g = null;
        b = null;
        m = null;
        o = c.notification_type;
        p = LI();
        n = c.project_name;
        j = f.full_name;
        j = "<b>" + j + "</b>";
        n = "<b>" + n + "</b>";
        q = "";
        if (o === "share_invitation_sent") {
            k = format(_("%s invited you to %s"), j, n);
            q = setHTML(SPAN(), k);
            g = DIV({
                c: "actions"
            }, d = A({
                href: "#",
                c: "accept"
            }, _("Accept")), s = A({
                href: "#",
                c: "reject"
            }, imageSprite("cmp_trash_small", 12, 12)));
            AEV(d, "click", function () {
                var u, t;
                h.showIndicator(g);
                u = function (v) {
                    var w;
                    w = format(_("Start collaborating on %s"), n);
                    swapDOM(p, p = LI({
                        c: "accepted"
                    }, _("Invitation accepted!"), BR(), setHTML(SPAN(), w)));
                    return AEV(p, "click", function () {
                        GB_hide();
                        ProjectList.setCurrentById(v.id);
                        return false
                    })
                };
                t = function (v) {
                    alert(v);
                    return h.hideIndicator(g)
                };
                NotificationsModel.acceptInvitation(c, u, t);
                return false
            });
            AEV(s, "click", function () {
                var u, t;
                AmiTooltip.hide();
                h.showIndicator(g);
                u = function () {
                    return removeElement(p)
                };
                t = function (v) {
                    alert(v);
                    return h.hideIndicator(g)
                };
                NotificationsModel.rejectInvitation(c, u, t);
                return false
            });
            AmiTooltip.showSimpleText(s, _("Reject"))
        }
        if (o === "share_invitation_accepted") {
            k = format(_("%s joined project %s"), j, n);
            q = setHTML(SPAN(), k);
            b = c.project_id
        }
        if (o === "share_invitation_rejected") {
            k = format(_("%s rejected your invitation to project %s"), j, n);
            q = setHTML(SPAN(), k);
            b = c.project_id
        }
        if (o === "user_left_project") {
            k = format(_("%s left project %s."), j, n);
            q = setHTML(SPAN(), k);
            b = c.project_id
        }
        if (o === "owner_left_project") {
            k = format(_("%s (owner) left project %s"), j, n);
            q = setHTML(SPAN(), k);
            b = c.project_id
        }
        if (o === "note_added") {
            m = true;
            k = format(_("%s added a comment"), j);
            q = setHTML(SPAN(), k);
            ACN(q, BR(), SPAN({
                c: "desc"
            }, c.note_content))
        }
        if (o.indexOf("item_") !== -1) {
            m = true;
            r = null;
            if (o === "item_assigned") {
                k = format(_("%s assigned a task"), j, n)
            } else {
                if (o === "item_completed") {
                    k = format(_("%s completed a task"), j, n);
                    r = "completed"
                } else {
                    if (o === "item_uncompleted") {
                        k = format(_("%s uncompleted a task"), j, n)
                    }
                }
            }
            q = setHTML(SPAN(), k);
            ACN(q, BR(), i = SPAN({
                c: "desc"
            }, c.item_content));
            if (r) {
                addClass(i, r)
            }
        }
        ACN(p, DIV({
            c: "avatar_holder"
        }, l), DIV({
            c: "text_holder"
        }, q, g));
        if (b) {
            AEV(p, "click", function () {
                GB_hide();
                ProjectList.setCurrentById(b);
                return false
            })
        } else {
            if (m) {
                AEV(p, "click", function () {
                    Notes.loadAndShow(c.item_id);
                    return false
                })
            }
        } if (g) {
            addClass(p, "has_actions")
        }
        if (c.is_unread) {
            addClass(p, "unread")
        }
        return p
    };
    a.prototype.showIndicator = function (b) {
        hideElement($bytc("a", null, b));
        return Indicator.addToElm(b)
    };
    a.prototype.hideIndicator = function (b) {
        Indicator.removeFromElm(b);
        return showElement($bytc("a", null, b))
    };
    return a
})();
Signals.connect("notifications_updated", function (a) {
    if (Notifications.timeout) {
        Notifications.timeout = null
    }
    return Notifications.updateIcon(a)
});
window.Notifications = new GNotifications();
var GAvatars;
GAvatars = (function () {
    function a() {}
    a.prototype.renderAvatar = function (c, d) {
        var b, f;
        f = c["avatar_" + d];
        b = IMG({
            src: f,
            c: "img_avatar"
        });
        return b
    };
    return a
})();
window.Avatars = new GAvatars();
ManageReminders = new Class({
    init: function (c, a, b) {
        bindMethods(this);
        this.view = b;
        this.ctx = a;
        if (c) {
            BufferedRemindersModel.cur_item = c.json;
            BufferedRemindersModel.use_buffered = false
        } else {
            BufferedRemindersModel.use_buffered = true
        }
    },
    min_to_words: {
        0: _("0 min"),
        10: _("10 min"),
        30: _("30 min"),
        45: _("45 min"),
        60: _("1 hour"),
        120: _("2 hours"),
        180: _("3 hours"),
        1440: _("1 day"),
        2880: _("2 days"),
        4320: _("3 days"),
        10080: _("1 week")
    },
    checkEmpty: function () {
        if ($bytc("tr", null, this.tbody).length == 0) {
            ACN(this.tbody, TR({
                "class": "no_rem"
            }, TD({
                colspan: 3
            }, _("No reminders are set"))));
            this.is_empty = true
        } else {
            map($bytc("tr", "no_rem"), function (a) {
                removeElement(a)
            });
            this.is_empty = false
        }
    },
    initInitial: function () {
        this.reminders = BufferedRemindersModel.getRemindersByItemId(BufferedRemindersModel.getCurItem().id);
        this.initAddUI();
        this.initViewUI()
    },
    initViewUI: function () {
        ACN(this.view, TABLE({
            "class": "view",
            width: "95%"
        }, this.tbody = TBODY()));
        map(this.reminders, this.renderItem);
        this.colorOddRows();
        this.checkEmpty()
    },
    renderItem: function (b) {
        var f;
        if (b.due_date || b.time) {
            if (isString(b.due_date)) {
                var d = new Date(b.due_date);
                b.time = d.getTime()
            }
            b.due_date = new Date(b.time);
            f = DateController.fullFormat(b.due_date, b.date_string)
        } else {
            f = _("%s before").replace("%s", this.min_to_words[b.minute_offset])
        }
        var a = imageSprite("cmp_trash img_del", 10, 11);
        var c;
        ACN(this.tbody, c = TR(TD(b.service), TD({
            "class": "td_time"
        }, f), TD({
            style: "text-align: right"
        }, a)));
        a.onclick = $p(this.deleteReminder, b.id, c)
    },
    colorOddRows: function () {
        AJS.map(AJS.$bytc("tr", null, this.tbody), function (b, a) {
            if (a % 2 == 1) {
                AJS.setClass(b, "odd")
            }
        })
    },
    deleteReminder: function (b, a) {
        BufferedRemindersModel.remove(b);
        removeElement(a);
        this.checkEmpty();
        this.colorOddRows();
        this.updateParentItem()
    },
    updateParentItem: function () {
        if (!BufferedRemindersModel.use_buffered) {
            var d = BufferedRemindersModel.getCurItem();
            d = ItemsModel.getById(d.id);
            var b = true;
            if (this.is_empty) {
                b = false
            }
            ItemsModel.updateCached(d, {
                has_notifications: b
            });
            ItemsModel.syncCachedData();
            var a = $("item_" + d.id);
            if (a) {
                var c = $bytc("span", "date", a);
                if (c.length > 0) {
                    c = c[0]
                } else {
                    c = $bytc("td", "project", a)[0]
                }
                ItemDueDates.updateAlarmIcon(c, d.has_notifications)
            }
        }
        var f = $("reminders_icon");
        if (this.is_empty) {
            removeClass(f, "cmp_reminders_on");
            addClass(f, "cmp_reminders")
        } else {
            removeClass(f, "cmp_reminders");
            addClass(f, "cmp_reminders_on")
        }
    },
    initAddUI: function () {
        var i = BufferedRemindersModel.getCurItem();
        var g, c;
        ACN(this.ctx, TABLE(TBODY(TR(c = TD()), TR(g = TD({
            width: "130"
        })))));
        ACN(g, this.type_div = DIV(this.date_select = SELECT(OPTION({
            value: 0
        }, _("Remind me on a specific time")), OPTION({
            value: 1
        }, _("Remind me before task's due date")))));
        AEV(this.date_select, "change", this.dateSelectChange);
        var d = i.date_string;
        if (window.I18N_LANG) {
            d = translate_to_english(I18N_LANG, LANG, d)
        }
        if (!DateController.hasTime(d)) {
            this.date_select.disabled = true
        } else {
            this.date_select.selectedIndex = 1
        }
        var f;
        var a = this;
        var b = function (m, l, n) {
            var j = window.User;
            var k = OPTION({
                value: l
            }, m);
            if (l == j.default_reminder && j[n]) {
                k.selected = true
            }
            k.id = "reminder_opt_" + l;
            if (!j[n]) {
                k.disabled = true
            }
            return k
        };
        ACN(c, f = this.service_select = SELECT(b(_("Via Email"), "email", "email"), b(_("Via Mobile SMS"), "mobile", "mobile_number"), b(_("Via Mobile push notifications"), "push", "has_push_reminders")));
        if (!window.IS_MINI) {
            ACN(f, OPTION({
                disabled: true
            }, "------"), OPTION({
                value: "manage"
            }, _("Reminders settings")));
            var h = 0;
            AEV(f, "focus", function () {
                h = f.selectedIndex
            });
            AEV(f, "change", function (j) {
                var k = getSelectValue(f);
                if (k == "manage") {
                    f.selectedIndex = h;
                    WindowOpener.showPrefs("reminders");
                    return false
                }
                return true
            })
        }
        ACN(this.ctx, this.time_ctx = DIV());
        ACN(this.ctx, this.submit = AmiButton.createButton(_("Add reminder"), null, "red"));
        this.dateSelectChange()
    },
    addRelativeReminder: function () {
        var a = BufferedRemindersModel.add({
            item_id: BufferedRemindersModel.getCurItem().id,
            service: this.service_select.value,
            minute_offset: this.time.value
        });
        this.renderItem(a);
        this.checkEmpty();
        this.colorOddRows();
        this.updateParentItem();
        return false
    },
    addAbsoluteReminder: function () {
        var a = this.service_select.value;
        var d = this.time.value;
        if (window.I18N_LANG) {
            d = translate_to_english(I18N_LANG, LANG, d)
        }
        var f = DateController.getUTC(d);
        var c;
        if (d == "") {
            c = _("Date can't be empty")
        } else {
            if (f == -1) {
                c = _("Invalid date")
            }
        }
        var g = DateController.hasTime(d);
        if (!g) {
            if (DateBocks.us_dates) {
                d += " @ 9am"
            } else {
                d += " @ 9:00"
            }
            f = DateController.getUTC(d)
        }
        if (c) {
            setHTML(this.error, c);
            showElement(this.error);
            return false
        } else {
            setHTML(this.error, "");
            hideElement(this.error)
        }
        var b = BufferedRemindersModel.add({
            item_id: BufferedRemindersModel.getCurItem().id,
            service: this.service_select.value,
            time: f[0].getTime(),
            due_date_utc: f[1],
            date_string: d
        });
        this.time.value = "";
        this.renderItem(b);
        this.checkEmpty();
        this.colorOddRows();
        this.updateParentItem();
        return false
    },
    dateSelectChange: function () {
        var a = this.date_select;
        var b = this.time_ctx;
        var c = a.value;
        if (c == 1) {
            this.renderRelative();
            this.submit.onclick = this.addRelativeReminder
        } else {
            this.renderAbsolute();
            this.submit.onclick = this.addAbsoluteReminder
        }
    },
    renderRelative: function () {
        RCN(this.time_ctx, this.time = SELECT(OPTION({
            value: 0
        }, _("0 minutes")), OPTION({
            value: 10
        }, _("10 minutes")), OPTION({
            value: 30,
            selected: "selected"
        }, _("30 minutes")), OPTION({
            value: 45
        }, _("45 minutes")), OPTION({
            value: 60
        }, _("1 hour")), OPTION({
            value: 120
        }, _("2 hours")), OPTION({
            value: 180
        }, _("3 hours")), OPTION({
            value: 1440
        }, _("1 day")), OPTION({
            value: 2880
        }, _("2 days")), OPTION({
            value: 4320
        }, _("3 days")), OPTION({
            value: 10080
        }, _("1 week"))), SMALL(_("%s before deadline.").replace("%s", "")))
    },
    renderAbsolute: function () {
        var a = this;
        var b = "tod at 12:30";
        if (window.I18N_LANG) {
            b = translate_to_lang(I18N_LANG, LANG, b)
        }
        RCN(this.time_ctx, this.time = INPUT({
            type: "text",
            name: "time",
            "class": "time text_box",
            placeholder: _("Date and Time")
        }), this.error = DIV({
            "class": "error"
        }), DIV(SPAN({
            "class": "desc"
        }, _("Ex:"), " ", b), A({
            href: "http://todoist.com/Help/timeInsert",
            target: "_blank",
            "class": "a_help"
        }, _("Help..."))));
        try {
            this.time.focus()
        } catch (c) {}
        hideElement(this.error);
        attachKeyDown(this.time, function (d) {
            d = d || window.event;
            setEventKey(d);
            if (d.keyAscii == 13) {
                a.submit.onclick();
                return false
            }
        });
        setTimeout(function () {
            a.time.focus()
        }, 50)
    }
});

function enableSMSReminders(a) {
    var b = $("reminder_opt_mobile");
    if (b) {
        update(window.User, a);
        if (a.mobile_number.length > 0) {
            b.disabled = false
        } else {
            b.disabled = true;
            b.parentNode.selectedIndex = 0
        }
    }
}
var Reminders = {
    renderHolder: function (f) {
        var b, a, c;
        b = DIV({
            c: "reminders"
        }, a = DIV({
            id: "ctx"
        }), DIV({
            c: "hr"
        }), c = DIV({
            id: "r_view"
        }));
        var d = new ManageReminders(f, a, c);
        d.initInitial();
        return b
    },
    showTooltip: function (h, b, d) {
        if (!IsPremium) {
            return PromotionOverlay.show(_("Reminders are a premium feature"))
        }
        setEditOn();
        var g = absolutePosition(b);
        var a = Reminders.renderHolder(h);
        var c = {
            fn_left_offset: function (j, i) {
                win_size = getWindowSize();
                return g.x - 240
            },
            fn_top_offset: function () {
                return g.y + 25
            },
            fn_arrow_left: function () {
                return g.x + 4
            },
            callback_fn: setEditOff,
            fixed_pos: hasClass(b, "fixed_pos")
        };
        var f = TooptipWin.show(_("Reminders"), a, 210, 275, c);
        addClass(f.g_window, "manage_reminders")
    },
    show: function (b) {
        if (IsPremium) {
            var a = Reminders.renderHolder(b);
            setEditOn();
            GB_showHTML(_("Reminders"), a, 350, 275, {
                callback_fn: setEditOff
            });
            return false
        } else {
            return PromotionOverlay.show(_("Reminders are a premium feature"))
        }
    }
};
_RE_REMIND = new RegExp("<rem[^\\s]+\\s*([^>]+)>", "ig");
Signals.connect("item_updated item_added", function (c) {
    var b = c.content;
    if (b && b.indexOf("<r") != -1) {
        var a = function (f, d) {
            var g = DateBocks.magicDate(d);
            if (g != -1 && DateController.hasTime(d)) {
                c.has_notifications = true
            } else {
                alert(_("Reminders should have a time, such as <b>%s</b>").replace("%s", "remind today at 2pm"))
            }
            return ""
        };
        c.content = c.content.replace(_RE_REMIND, a)
    }
});
ArrowTop = {
    generate: function (b, c) {
        if (!b) {
            b = "left"
        }
        var a = {
            c: "arrow_top",
            style: "text-align: " + b
        };
        if (c == "black") {
            return DIV(a, imageSprite("cmp_19_arrow_up", 25, 6))
        } else {
            return DIV(a, imageSprite("cmp_11_arrow_up", 25, 6))
        }
    }
};
Alerts = {
    _confirmed: false,
    install: function () {
        window.oldAlert = window.alert;
        window.alert = Alerts.alert
    },
    confirm: function (d, f) {
        Alerts._confirmed = false;
        var a = Alerts.renderHolder(d);
        ACN(a.icon, IMG({
            src: "https://d3ptyyxy2at9ui.cloudfront.net/1143e7a9554f4bf76002e38a72b0ff78.png"
        }));
        var c;
        ACN(a.buttons, btn = BUTTON({}, _("Ok")));
        AEV(btn, "click", function () {
            Alerts._confirmed = true;
            GB_hide()
        });
        var b;
        ACN(a.buttons, b = A({
            href: "#",
            c: "cancel"
        }, _("Cancel")));
        AEV(b, "click", GB_hide);
        GB_showHTML("", a.frame, 180, 330, {
            callback_fn: function () {
                f(Alerts._confirmed)
            }
        });
        btn.focus()
    },
    alert: function (c, b) {
        var a = Alerts.renderHolder(c);
        ACN(a.icon, IMG({
            src: "https://d3ptyyxy2at9ui.cloudfront.net/2cfe64beccbbbe1870ae91762afd7a1f.png"
        }));
        ACN(a.buttons, btn = BUTTON({}, _("Ok")));
        AEV(btn, "click", function () {
            GB_hide();
            if (isFunction(b)) {
                b()
            }
        });
        GB_showHTML("", a.frame, 200, 330);
        btn.focus()
    },
    renderHolder: function (d) {
        var f, b, a;
        if (d && d.replace) {
            d = d.replace(/\n/g, "<br>");
            f = setHTML(DIV({
                c: "text_holder"
            }), d)
        } else {
            f = DIV({
                c: "text_holder"
            }, d)
        }
        var c = DIV({
            c: "alert_holder"
        }, a = DIV({
            c: "icon_holder"
        }), f, CENTER(b = DIV()));
        return {
            frame: c,
            icon: a,
            text: f,
            buttons: b
        }
    }
};
Alerts.install();
var AmiTT;
var AmiTT_shown = false;
var AmiTT_alignment = "left";
var AmiTooltip = {
    cur_elm: null,
    init: function () {
        if (AmiTT) {
            return
        }
        AmiTT = AJS.DIV({
            c: "AmiTT_main"
        });
        AmiTooltip.updateAlignment();
        AJS.hideElement(AmiTT);
        AJS.ACN(AJS.getBody(), AmiTT);
        AEV(window, "scroll", function (a) {
            if (AmiTooltip.cur_elm) {
                AmiTooltip.locate(AmiTooltip.cur_elm)
            }
        })
    },
    updateAlignment: function () {
        removeElement($bytc("div", "AmiTT_arrow_top", AmiTT));
        if (AmiTT_alignment) {
            appendToTop(AmiTT, DIV({
                c: "AmiTT_arrow_top"
            }, ArrowTop.generate(AmiTT_alignment, "black")))
        }
    },
    setAlignment: function (a) {
        AmiTT_alignment = a;
        AmiTooltip.updateAlignment()
    },
    show: function (g, f, d, c, b, a) {
        if (a != true) {
            a = false
        }
        AmiTooltip.cur_elm = g;
        setVisibility(f, false);
        AmiTT_shown = true;
        AJS.RCN(AmiTT, f);
        AmiTooltip.top_offset = c;
        AmiTooltip.left_offset = b;
        AmiTooltip.include_scroll_top = a;
        AJS.showElement(AmiTT);
        AmiTooltip.updateAlignment();
        setVisibility(f, true);
        AmiTooltip.locate(g, d);
        return false
    },
    hide: function (b) {
        if (!window.AmiTT) {
            return
        }
        AmiTT_shown = false;
        var a = function () {
            if (!AmiTT_shown) {
                AJS.hideElement(AmiTT);
                AmiTooltip.cur_elm = null;
                AmiTooltip.top_offset = 0;
                AmiTooltip.left_offset = 0
            }
        };
        RCN(AmiTT, null);
        if (b == true) {
            a()
        } else {
            setTimeout(a, 100)
        }
        return false
    },
    locate: function (i, d) {
        if (!i) {
            return
        }
        var b = AmiTooltip.cur_elm;
        var h = absolutePosition(b);
        var g = h.x - 5,
            c = AmiTT.offsetWidth,
            a = AJS.getWindowSize().w;
        if (g + c + 10 > a) {
            g -= c - 10 - b.offsetWidth;
            AmiTooltip.setAlignment("right")
        } else {
            AmiTooltip.setAlignment("left")
        } if (isNumber(AmiTooltip.top_offset)) {
            h.y += AmiTooltip.top_offset
        } else {
            if (isFunction(AmiTooltip.top_offset)) {
                h.y += AmiTooltip.top_offset()
            }
        } if (isNumber(AmiTooltip.left_offset)) {
            g += AmiTooltip.left_offset
        } else {
            if (isFunction(AmiTooltip.left_offset)) {
                g += AmiTooltip.left_offset()
            }
        }
        var f = h.y + b.offsetHeight + 2;
        if (hasClass(b, "fixed_pos")) {
            f += getScrollTop()
        }
        if (AmiTooltip.include_scroll_top) {
            f += getScrollTop()
        }
        AJS.setTop(AmiTT, f);
        AJS.setLeft(AmiTT, g)
    },
    showSimpleText: function (g, f, d, b, a) {
        var c = function (h) {
            if (isFunction(d) && !d(h)) {
                return false
            }
            AmiTooltip.show(g, DIV({
                c: "tooltip_cnt"
            }, f), h, b, a)
        };
        AEV(g, "mouseover", c);
        AEV(g, "mouseout", AmiTooltip.hide)
    },
    showTooltip: function (f, d, c, b, a) {
        AEV(f, "mouseover", function (g) {
            var h = d;
            if (isFunction(d)) {
                h = d(g)
            }
            if (isString(h)) {
                h = setHTML(DIV({
                    c: "tooltip_cnt"
                }), h)
            } else {
                h = DIV({
                    c: "tooltip_cnt"
                }, h)
            }
            return AmiTooltip.show(f, h, g, c, b, a)
        });
        AEV(f, "mouseout", AmiTooltip.hide)
    }
};
AJS.AEV(window, "load", AmiTooltip.init);
AmiComplete = {
    tab_complete: true,
    txt_no_matches_found: _("No matches. Press ESC to hide auto-completion."),
    current_input: null,
    callbacks: {
        on_show: [],
        on_hide: []
    },
    init: function () {
        var a = DIV({
            id: "amicomplete_floater"
        }, TABLE(TBODY()));
        hideElement(a);
        ACN(getBody(), a)
    },
    shown: function () {
        return isElementShown($("amicomplete_floater"))
    },
    attach: function (a, b) {
        if (b.require_at == undefined) {
            b.require_at = true
        }
        ElementStore.set(a, "amicomplete_data", b);
        AEV(a, "keydown", AmiComplete.handleKeyDown);
        AEV(a, "keypress", AmiComplete.handleKeyPress);
        AEV(a, "keyup", function (d) {
            var f = ElementStore.get(a, "amicomplete_data");
            if (f.require_at) {
                var c = f.trigger || "@";
                if (a.value.indexOf(a._word) == -1 || a.value.indexOf(c) == -1) {
                    a._word = "";
                    AmiComplete.hide()
                }
            }
        })
    },
    handleKeyDown: function (b) {
        if (isSafari() || isIe()) {
            var a = AmiComplete._handleSpecialKeys(b);
            if (a != undefined) {
                return a
            }
            if (b.keyAscii == 8) {
                AmiComplete.handleKeyPress(b)
            }
        }
    },
    handleKeyPress: function (g, b) {
        if (!b) {
            b = getEventElm(g)
        }
        var h = ElementStore.get(b, "amicomplete_data");
        if (h && h.keyPressListener) {
            h.keyPressListener(g, b, h)
        }
        var d = AmiComplete._handleSpecialKeys(g);
        if (d != undefined) {
            return d
        }
        var f = g.keyAscii;
        var i = WordHandler.handleKeyPress(g);
        var a = LibEdit.getCursorPosition(b);
        var c = h.trigger || "@";
        if (f != 8 && i == c && a && b.value.charAt(a - 1) != " ") {
            b._word = "";
            return true
        }
        if (f == 8 && i == "" && h.on_delete_empty) {
            h.on_delete_empty()
        }
        if (h.require_at) {
            if (i && i.indexOf(c) == 0) {
                AmiComplete.show(b, h, i)
            } else {
                AmiComplete.hide()
            }
        } else {
            AmiComplete.show(b, h, i)
        }
    },
    reRender: function (d) {
        var b = $("amicomplete_floater");
        if (b) {
            AmiComplete.hide();
            var a = AmiComplete.current_input;
            var c = ElementStore.get(a, "amicomplete_data");
            c.collection = d;
            AmiComplete.show(a, c, a._word || "");
            a.focus()
        }
    },
    forceShow: function (c, d) {
        if (AmiComplete.current_input == c && isElementShown($("amicomplete_floater"))) {
            return false
        }
        var g = ElementStore.get(c, "amicomplete_data");
        var f = g.trigger || "@";
        var b = LibEdit.getCursorPosition(c);
        var a = b && c.value.charAt(b - 1) != " ";
        if (d) {
            if (a != " ") {
                LibEdit.insertAtCursor(c, " " + f)
            } else {
                LibEdit.insertAtCursor(c, f)
            }
            c._word = f
        } else {
            c._word = ""
        }
        AmiComplete.show(c, g, c._word);
        return false
    },
    show: function (k, g, a) {
        var f = $("amicomplete_floater");
        if (!ElementStore.get(k, "amicomplete_data")) {
            ElementStore.set(k, "amicomplete_data", g)
        }
        if (window.GB_getLast && GB_getLast()) {
            f.style.zIndex = GB_getLast().cur_zindex + 1000
        } else {
            f.style.zIndex = 1000
        }
        var i = $gc(f, "tbody");
        AmiComplete.current_input = k;
        var g = ElementStore.get(k, "amicomplete_data");
        var c = g.trigger || "@";
        var a = a || "";
        a = AmiComplete.escapeReqExpSepcails(a.replace(c, ""));
        if (g.wildcard_match) {
            var h = new RegExp(a, "gi")
        } else {
            var h = new RegExp("^" + a, "gi")
        }
        var b = [];
        if (g.collection) {
            map(g.collection(), function (n) {
                var m = n.name.match(h);
                if (m) {
                    b.push([m[0], n])
                }
            })
        }
        RCN(i, null);
        if (g.onNoMatches && b.length == 0) {
            return g.onNoMatches()
        } else {
            if (b.length == 0) {
                ACN(i, TR(TD(AmiComplete.txt_no_matches_found)))
            } else {
                map(b, function (m) {
                    var p = m[1];
                    var n = p.name.replace(m[0], "<b>" + m[0] + "</b>");
                    if (p.description) {
                        n += " [" + p.description + "]"
                    }
                    if (g.filterItem) {
                        n = g.filterItem(p, n)
                    }
                    if (!n) {
                        return
                    }
                    var o;
                    ACN(i, TR(o = TD({
                        c: "completion_item"
                    }, n)));
                    o.onmouseover = $p(AmiComplete.tdMouseOver, o, p);
                    if (g.onclick) {
                        o.onclick = $p(g.onclick, o, p)
                    } else {
                        o.onclick = $p(AmiComplete.tdOnclick, o, p)
                    }
                });
                var d = $gc(i, "td");
                d.onmouseover()
            }
        }
        AmiComplete.rePosition(k);
        showElement(f);
        map(AmiComplete.callbacks.on_show, function (m) {
            m(k, f)
        });
        var l = $gc(document, "td", "current_match");
        try {
            l.onmouseover(true)
        } catch (j) {}
    },
    rePosition: function (a) {
        var g = $("amicomplete_floater");
        if (!g) {
            return
        }
        var c = ElementStore.get(a, "amicomplete_data");
        var d = c.position_item || a;
        var f = absolutePosition(d);
        if (hasClass(a, "fixed_pos")) {
            f.y += getScrollTop()
        }
        if (c.offset_top) {
            f.y += c.offset_top
        }
        setTop(g, f.y + d.offsetHeight - 2);
        if (isIe()) {
            f.x -= 1
        }
        setLeft(g, f.x);
        var b = d.offsetWidth - 2;
        if (c.extra_width) {
            b += c.extra_width
        }
        setWidth(g, b)
    },
    hide: function (a) {
        if (AmiComplete.current_input) {
            AmiComplete.current_input._word = ""
        }
        hideElement($("amicomplete_floater"));
        map(AmiComplete.callbacks.on_hide, function (b) {
            b($("amicomplete_floater"))
        })
    },
    selectCurrentMatch: function () {
        var a = $gc(document, "td", "current_match");
        if (a) {
            a.onclick()
        }
    },
    selectPrev: function (a) {
        AmiComplete._selectGeneric(a, "previousSibling");
        return false
    },
    selectNext: function (a) {
        AmiComplete._selectGeneric(a, "nextSibling");
        return false
    },
    tdMouseOver: function (c, b, a) {
        removeClass($bytc("td", "current_match"), "current_match");
        addClass(c, "current_match");
        if (a == true) {
            $("amicomplete_floater").scrollTop = $gp(c, "tr").offsetTop
        }
    },
    tdOnclick: function (d, j) {
        var i = AmiComplete.current_input;
        var f = ElementStore.get(i, "amicomplete_data");
        var c = f.trigger || "@";
        var b = AmiComplete.escapeReqExpSepcails(i._word.replace(c, ""));
        b = new RegExp("^" + b, "i");
        var g = j.name.replace(b, "");
        LibEdit.insertAtCursor(i, g + " ");
        var h = new RegExp(c + AmiComplete.escapeReqExpSepcails(j.name), "i");
        if (f.onSelect) {
            i.value = f.onSelect(j, i)
        } else {
            var a = c + j.name;
            i.value = i.value.replace(h, a)
        }
        i._word = "";
        AmiComplete.hide()
    },
    _selectGeneric: function (c, b) {
        var f = $gc(document, "td", "current_match");
        if (f) {
            var a = $gp(f, "tr")[b];
            try {
                $gc(a, "td").onmouseover(true)
            } catch (d) {}
        }
        if (c) {
            preventDefault(c)
        }
    },
    _handleSpecialKeys: function (b) {
        var a = b.keyAscii;
        if (AmiComplete.shown()) {
            if (a == 13 || AmiComplete.tab_complete && a == 9) {
                setTimeout(function () {
                    AmiComplete.selectCurrentMatch()
                }, 10);
                return false
            }
            if (b.keyAscii == 37 || b.keyAscii == 38) {
                return AmiComplete.selectPrev(b)
            }
            if (b.keyAscii == 39 || b.keyAscii == 40) {
                return AmiComplete.selectNext(b)
            }
            if (b.keyAscii == 27) {
                setTimeout(AmiComplete.hide, 10);
                return false
            }
        }
    },
    escapeReqExpSepcails: function (a) {
        return a.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
    }
};
WordHandler = {
    handleKeyPress: function (f) {
        var b = getEventElm(f);
        var g = ElementStore.get(b, "amicomplete_data");
        if (g.whole_input_match && f.keyAscii != 8) {
            b._word = b.value + String.fromCharCode(f.keyAscii);
            return b._word
        }
        var c = g.trigger || "@";
        var d = c.charCodeAt(0);
        var a = b._word;
        if (f.keyAscii == 8 && a) {
            b._word = a.substr(0, a.length - 1)
        } else {
            if (f.keyAscii == 8) {
                b._word = ""
            } else {
                if (f.keyAscii == 32 || f.keyAscii == 27) {
                    b._word = ""
                } else {
                    if (f.keyAscii == d) {
                        b._word = c
                    } else {
                        if (f.keyAscii) {
                            if (f.keyAscii != d && f.keyAscii <= 40) {} else {
                                if (!b._word) {
                                    b._word = "" + String.fromCharCode(f.keyAscii)
                                } else {
                                    b._word += String.fromCharCode(f.keyAscii)
                                }
                            }
                        }
                    }
                }
            }
        }
        return b._word
    },
    resetWord: function (b) {
        var a = getEventElm(b);
        a._word = "";
        return a._word
    }
};
DummyText = {
    attach: function (a, c, b, d) {
        a.placeholder = b;
        if (d && d.on_focus) {
            AEV(a, "focus", d.on_focus)
        }
        if (d && d.on_blur) {
            AEV(a, "blur", d.on_blur)
        }
        return
    },
    isEmpty: function (a) {
        if (hasClass(a, "dummy_text")) {
            return true
        }
        if (a.value == "") {
            return true
        }
        return false
    }
};
LibEdit = {
    placeCursor: function (c, b) {
        if (AJS.isIe()) {
            var a = c.createTextRange();
            a.collapse(true);
            a.move("character", b);
            a.select()
        } else {
            if (c.selectionStart || c.selectionStart == "0") {
                c.selectionStart = b;
                c.selectionEnd = b
            }
        }
        setTimeout(function () {
            c.focus()
        }, 30)
    },
    getCursorPosition: function (g) {
        try {
            if (g.selectionStart) {
                return g.selectionStart
            } else {
                if (!document.selection) {
                    return 0
                }
            }
            var h = "\001";
            var d = document.selection.createRange();
            var b = d.duplicate();
            var a = 0;
            b.moveToElementText(g);
            d.text = h;
            a = (b.text.indexOf(h));
            d.moveStart("character", -1);
            d.text = "";
            if (a == -1) {
                a = g.value.length
            }
            return a
        } catch (f) {
            return g.value.length
        }
    },
    insertAtCursor: function (l, f, c) {
        var g = f.indexOf("~`");
        if (g == -1) {
            g = f.length
        }
        f = f.replace("~`", "");
        if (document.selection) {
            if (DummyText.isEmpty(l)) {
                removeClass(l, "dummy_text");
                l.value = "";
                l._word = ""
            }
            l.focus();
            var b = document.selection.createRange();
            var i = b.text;
            b.text = f;
            var k = f.length - g;
            b.moveStart("character", -k);
            b.moveEnd("character", -k);
            b.select();
            if (c) {
                LibEdit.insertAtCursor(l, i)
            }
        } else {
            if (l.selectionStart || l.selectionStart == "0") {
                l.focus();
                var j = l.scrollTop;
                var h = l.selectionStart;
                var a = l.selectionEnd;
                var i = l.value.substring(h, a);
                g += h;
                l.value = l.value.substring(0, h) + f + l.value.substring(a, l.value.length);
                l.selectionStart = g;
                l.selectionEnd = g;
                l.scrollTop = j;
                if (c) {
                    LibEdit.insertAtCursor(l, i)
                }
            } else {
                l.value += f
            }
        } if (l.resize_textarea) {
            l.resize_textarea(l)
        }
    }
};
FocusElm = {
    focus: function (a, f, d) {
        if (!parseInt(d)) {
            d = 35
        }
        var c = getWindowSize().h + getScrollTop();
        var b = absolutePosition(a).y + a.offsetHeight;
        if (b > c) {
            window.scrollTo(0, b - getWindowSize().h + d)
        }
        if (isFunction(f)) {
            f()
        }
    }
};
AmiButton = {
    disable: function (a) {
        if (!a) {
            return
        }
        a.disabled = true;
        addClass(a, "amibutton_disabled")
    },
    enable: function (a) {
        if (!a) {
            return
        }
        a.disabled = false;
        removeClass(a, "amibutton_disabled")
    },
    createButton: function (d, c, b) {
        if (!c) {
            c = null
        }
        if (d) {
            d = SPAN(d)
        }
        var a = A({
            href: "#",
            c: "amibutton"
        }, c, d);
        if (b) {
            addClass(a, "amibutton_" + b)
        }
        AEV(a, "mousedown", function (f) {
            if (a.disabled) {
                return false
            }
            addClass(a, "amibutton_mousedown");
            return false
        });
        AEV(a, ["mouseup", "mouseout", "click"], function (f) {
            if (a.disabled) {
                return false
            }
            removeClass(a, "amibutton_mousedown")
        });
        return a
    },
    createMiniButton: function (c, b) {
        var a = AmiButton.createButton(null, c, b);
        addClass(a, "amibutton_mini");
        return a
    },
    createBigButton: function (d, c, b) {
        var a = AmiButton.createButton(d, c, b);
        addClass(a, "amibutton_big");
        return a
    }
};
AmiCheckbox = {
    size: 16,
    cls_off: "cmp_12_checkbox_off amicheckbox_img",
    cls_on: "cmp_14_checkbox_on amicheckbox_img",
    cls_down: "cmp_14_checkbox_on amicheckbox_down amicheckbox_img",
    genereate: function () {
        var c;
        var b = AmiCheckbox.size;
        var a = DIV({
            c: "amicheckbox"
        }, c = imageSprite(AmiCheckbox.cls_off, b, b));
        a.image = c;
        AEV(a, "mousedown", function (d) {
            if (d.shift || d.ctrl || window.DragAndDrop) {
                return false
            }
            setClass(c, AmiCheckbox.cls_down)
        });
        AEV(a, ["mouseout"], function () {
            if (a.checked) {
                setClass(c, AmiCheckbox.cls_on)
            } else {
                setClass(c, AmiCheckbox.cls_off)
            }
        });
        return a
    },
    setIndicator: function (a) {
        if (a) {
            var b = $gc(a, "img");
            b.src = "https://d3ptyyxy2at9ui.cloudfront.net/b5db1fca5b925aa148e6e79375b18ab8.gif";
            setClass(b, "amicheckbox_img")
        }
    },
    setDisabled: function (b, a) {
        if (!b) {
            return
        }
        b = $gp(b, "div", "amicheckbox");
        b.disabled = a
    },
    setChecked: function (d, c) {
        if (!d) {
            return
        }
        if (d.className != "amicheckbox") {
            d = $gp(d, "div", "amicheckbox")
        }
        var a = d.image || $gc(d, "img", "amicheckbox_img");
        if (a && c) {
            setClass(a, AmiCheckbox.cls_on)
        } else {
            if (a) {
                setClass(a, AmiCheckbox.cls_off)
            }
        }
        var b = "https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif";
        if (a.src.indexOf(b) == -1) {
            a.src = b
        }
        d.checked = c
    }
};
AmiBubble = {
    create: function (d, a) {
        if (a) {
            a = " " + a
        } else {
            a = ""
        }
        var c;
        var b = A({
            href: "#",
            c: "amibubble" + a
        }, SPAN({
            c: "inner"
        }, c = SPAN(d)));
        b.content = c;
        b.tabIndex = 1000;
        return b
    }
};
AmiMenu = Class({
    init: function (a) {
        bindMethods(this);
        this.args = a || {};
        this.menu_holder = DIV({
            "class": "AmiMenu"
        });
        hideElement(this.menu_holder);
        this.menu_table = TABLE({
            cellpadding: 0,
            cellspacing: 0
        });
        this.menu = TBODY();
        ACN(this.menu_table, this.menu);
        ACN(this.menu_holder, this.menu_table);
        ACN(getBody(), this.menu_holder);
        this.shown = false;
        this.current_item = null;
        this.hide_menu_icon = false;
        this.hide_callbacks = []
    },
    _createListItem: function (d) {
        var b = TD();
        var a = TR(b);
        if (d.onclick) {
            var c = this;
            AEV(b, "click", $p(d.onclick, b))
        }
        if (d.extra == "fade_item") {
            this.fade_item = d.view
        }
        AEV(b, "mouseover", $p(this.mouseOver, b));
        AEV(b, "mouseout", $p(this.mouseOut, b));
        if (d.extra_class) {
            addClass(a, d.extra_class)
        }
        if (d.extra && d.extra.extra_class) {
            addClass(a, d.extra.extra_class)
        }
        if (d.extra && d.extra.id) {
            b.id = d.extra.id
        }
        ACN(b, d.view);
        return a
    },
    _createSeparator: function (a) {
        var b = TR(TD({
            "class": "separator"
        }));
        if (a.extra_class) {
            addClass(b, a.extra_class)
        }
        return b
    },
    mouseOut: function (a) {
        removeClass(a, "on")
    },
    mouseOver: function (a) {
        addClass(a, "on")
    },
    clearItems: function () {
        var a = TBODY();
        swapDOM(this.menu, a);
        this.menu = a
    },
    addItem: function (a) {
        if (a.type == "item") {
            a = this._createListItem(a)
        }
        if (a.type == "separator") {
            a = this._createSeparator(a)
        }
        ACN(this.menu, a)
    },
    addItems: function () {
        var a = this;
        map(arguments, $b(function (b) {
            a.addItem(b)
        }, this))
    },
    show: function (j, f) {
        if (window.AmiTooltip) {
            AmiTooltip.hide()
        }
        if (isDict(j) && f) {
            var i = getMousePos(f)
        } else {
            var i = absolutePosition(j)
        } if (window.GB_getLast && GB_getLast()) {
            this.menu_holder.style.zIndex = GB_getLast().cur_zindex + 500
        } else {
            this.menu_holder.style.zIndex = 505
        }
        var c = A({
            href: "javascript:;",
            name: "link"
        }, ".");
        var h = {
            view: c
        };
        if (!isDict(j)) {
            if (hasClass(j, "fixed_pos")) {
                i.y += getScrollTop()
            }
            i.y += j.offsetHeight
        }
        setTop(this.menu_holder, i.y);
        showElement(this.menu_holder);
        FocusElm.focus(this.menu_holder);
        var g = getWindowSize();
        var b = i.x;
        var a = this.menu_holder.offsetWidth;
        if ((b + a + 15) > g.w) {
            setLeft(this.menu_holder, (i.x - a + 25))
        } else {
            setLeft(this.menu_holder, (i.x + 10))
        }
        c.focus();
        this.shown = true;
        this.current_item = j;
        j.menu_shown = true
    },
    toggle: function (d, a, b) {
        try {
            this.current_holder = a;
            if (this.shown) {
                this.hide(null, true);
                if (d != this.current_item) {
                    this.show(d, b)
                }
            } else {
                this.show(d, b)
            }
        } catch (c) {}
        return false
    },
    _hideMenuIcon: function (f, d) {
        try {
            if (d && f) {
                var b = getParentBytc(d, "li");
                var a = getParentBytc(f, "li");
                if (b == a) {
                    return false
                }
            }
            if (f && this.shown && this.hide_menu_icon) {
                f.menu_shown = false;
                removeClass(f, "shown")
            }
        } catch (c) {}
    },
    hide: function (b, c) {
        var f;
        if (b) {
            f = b && getEventElm(b)
        }
        if (isSafari()) {
            map($FA(this.menu.childNodes), function (h) {
                var g = h.firstChild;
                removeClass(g, "on")
            })
        }
        var d = this.current_item;
        if (c) {
            this._hideMenuIcon(d, f);
            this.shown = false;
            hideElement(this.menu_holder);
            return false
        }
        if (hasClass(f, "menu") || hasClass(f, "icon") || hasClass(f, "menu_icon")) {
            return
        }
        if ($gp(f, "div", "AmiMenu") || $gp(f, null, "menu_clickable")) {
            return true
        }
        this._hideMenuIcon(d, f);
        this.shown = false;
        hideElement(this.menu_holder);
        var a = this;
        map(this.hide_callbacks, function (g) {
            g(a, b)
        })
    }
});

function createItem(d, c, b) {
    b = b || {};
    var a = {
        view: DIV(),
        type: "item",
        onclick: c,
        extra: b
    };
    if (isString(d)) {
        setHTML(a.view, d)
    } else {
        ACN(a.view, d)
    }
    return a
}

function createSeparator(a) {
    return {
        type: "separator",
        extra_class: a
    }
}

function imageSprite(b, d, a, c) {
    if (c) {
        b += " " + c
    }
    return IMG({
        src: "https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif",
        width: d,
        height: a,
        c: b
    })
}

function imageSpriteMO(g, f, d, a, c) {
    if (c) {
        c = " " + c
    } else {
        c = ""
    }
    g = g + c;
    f = f + c;
    var b = imageSprite(g, d, a);
    AEV(b, "mouseover", function () {
        addClass(b, f);
        removeClass(b, g)
    });
    AEV(b, "mouseout", function () {
        if (!hasClass(b, "frozen")) {
            removeClass(b, f);
            addClass(b, g)
        }
    });
    return b
}
var MiniCal = {
    offset_x: 0,
    offset_y: 0,
    with_arrow_top: true,
    close_fn_eval: null,
    init: function (a) {
        this.dayChars = 1;
        this.dayNames = [_("Sunday"), _("Monday"), _("Tuesday"), _("Wednesday"), _("Thursday"), _("Friday"), _("Saturday")];
        this.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.monthNames = [_("January"), _("February"), _("March"), _("April"), _("May"), _("June"), _("July"), _("August"), _("September"), _("October"), _("November"), _("December")];
        this.startDay = 1;
        this.yearOrder = "asc";
        this.id = "dp_";
        this.disableFutureDates = false;
        this.initToday(true);
        if (a) {
            update(this, a)
        }
        this.container = null;
        this.interval = null;
        this.active = false;
        AEV(window, "resize", $b(this.position, this));
        AEV(document, "click", function (c) {
            var d = getEventElm(c);
            var b = MiniCal.close_fn_eval;
            if (b && b()) {
                return true
            }
            if (hasClass(d, "dp_icon")) {
                return true
            } else {
                if ($gp(d, "div", "dp_cal") || $gp(d, "a", "dp_icon")) {
                    return true
                } else {
                    MiniCal.remove()
                }
            }
        })
    },
    initToday: function (a) {
        this.yearStart = (new Date().getFullYear());
        this.yearRange = this.yearStart - 2007;
        this.today = new Date();
        this.nowYear = this.today.getFullYear();
        this.nowMonth = this.today.getMonth();
        this.nowDay = this.today.getDate();
        if (a) {
            this.then = this.today;
            this.oldYear = this.year = this.then.getFullYear();
            this.oldMonth = this.month = this.then.getMonth();
            this.oldDay = this.then.getDate()
        }
    },
    attachListener: function (a) {
        AEV(a, "click", function (c) {
            var b = $b(MiniCal.create, MiniCal);
            b(a)
        })
    },
    annotateInner: function (a) {},
    onSelect: function (a) {},
    noDate: function () {},
    create: function (s) {
        if (this.click_elm == s) {
            return this.remove()
        }
        if (this.container) {
            removeElement(this.container);
            this.container = null
        }
        this.initToday(false);
        this.click_elm = s;
        this.container = DIV({
            c: "dp_container"
        }, this.inner = DIV({
            "class": "dp_cal"
        }));
        if (this.with_arrow_top) {
            ATT(this.container, this.arrow_top = ArrowTop.generate("center", "white"))
        }
        ACN(getBody(), this.container);
        this.position();
        var u = new Date();
        if (this.month && this.year) {
            u.setFullYear(this.year, this.month, 1)
        } else {
            this.month = u.getMonth();
            this.year = u.getFullYear();
            u.setDate(1)
        }
        this.year % 4 == 0 ? this.daysInMonth[1] = 29 : this.daysInMonth[1] = 28;
        var p = (1 - (7 + u.getDay() - this.startDay) % 7);
        var l = SELECT({
            id: this.id + "_monthSelect",
            c: ""
        });
        for (var q = 0; q < this.monthNames.length; q++) {
            var d = OPTION({
                value: q
            }, this.monthNames[q]);
            ACN(l, d);
            if (this.month == q) {
                d.selected = true
            }
        }
        var n = SELECT({
            id: this.id + "_yearSelect"
        });
        r = 0;
        this.yearStart ? this.yearStart : this.yearStart = u.getFullYear();
        if (this.yearOrder == "desc") {
            for (var o = this.yearStart; o > (this.yearStart - this.yearRange - 1); o--) {
                var d = OPTION({
                    value: o
                }, o);
                if (this.year == o) {
                    d.selected = true
                }
                ACN(n, d);
                r++
            }
        } else {
            for (var o = this.yearStart; o < (this.yearStart + this.yearRange + 1); o++) {
                var d = OPTION({
                    value: o
                }, o);
                if (this.year == o) {
                    d.selected = true
                }
                ACN(n, d);
                r++
            }
        }
        var b = TABLE();
        var v = THEAD();
        var j = TR();
        var c = TH({
            colSpan: "7",
            c: "dp_nav_top"
        });
        var k;
        ACN(c, k = A({
            href: "#",
            c: "dp_nav"
        }, imageSprite("cmp_10_arrow_left", 16, 18)));
        AEV(k, "click", $b(MiniCal.selectPrevMonth, MiniCal));
        ACN(c, l);
        ACN(c, n);
        ACN(c, k = A({
            href: "#",
            c: "dp_nav"
        }, imageSprite("cmp_9_arrow_right", 16, 18)));
        AEV(k, "click", $b(MiniCal.selectNextMonth, MiniCal));
        ACN(j, c);
        ACN(v, j);
        var g = TBODY();
        var h = TR();
        for (var r = 0; r < this.dayNames.length; r++) {
            calDayNameCell = TH(this.dayNames[(this.startDay + r) % 7].substr(0, this.dayChars));
            ACN(h, calDayNameCell)
        }
        ACN(g, h);
        while (p <= this.daysInMonth[this.month]) {
            calDayRow = TR();
            for (r = 0; r < 7; r++) {
                if ((p <= this.daysInMonth[this.month]) && (p > 0)) {
                    calDayCell = TD({
                        "class": this.id + "_calDay",
                        axis: this.year + "|" + (parseInt(this.month) + 1) + "|" + p
                    }, p);
                    if (MiniCal.annotateDate) {
                        MiniCal.annotateDate(calDayCell, MiniCal.genDate(this.year, this.month, p))
                    }
                    ACN(calDayRow, calDayCell)
                } else {
                    calDayCell = TD({
                        "class": "dp_empty"
                    }, " ");
                    ACN(calDayRow, calDayCell)
                } if ((p == this.oldDay) && (this.month == this.oldMonth) && (this.year == this.oldYear)) {
                    addClass(calDayCell, "dp_selected")
                }
                if ((p == this.nowDay) && (this.month == this.nowMonth) && (this.year == this.nowYear)) {
                    addClass(calDayCell, "dp_today")
                }
                if (((p < this.nowDay) && (this.month <= this.nowMonth) && (this.year <= this.nowYear)) || ((this.month < this.nowMonth) && (this.year <= this.nowYear))) {
                    addClass(calDayCell, "dp_old_day")
                }
                p++
            }
            ACN(g, calDayRow)
        }
        ACN(b, v);
        ACN(b, g);
        ACN(this.inner, b);
        this.annotateInner(this.inner);
        var w = this;
        var f = new Date();
        map($bytc("td", this.id + "_calDay"), function (m) {
            if (w.disableFutureDates) {
                var x = m.axis.split("|");
                var i = new Date();
                i.setFullYear(x[0]);
                i.setDate(x[2]);
                i.setMonth(x[1] - 1);
                if (i > f && !hasClass(m, "dp_today")) {
                    addClass(m, "dp_disabled");
                    return
                }
            }
            AEV(m, "mouseover", function () {
                addClass(m, "dp_roll")
            });
            AEV(m, "mouseout", function () {
                removeClass(m, "dp_roll")
            });
            m.onclick = $b(function () {
                var y = m.axis.split("|");
                w.setCurrent(y[0], y[1], y[2])
            }, this)
        });
        n.onfocus = l.onfocus = function () {
            w.active = true
        };
        n.onchange = l.onchange = function () {
            w.month = l.value;
            w.year = n.value;
            var i = w.click_elm;
            w.remove();
            w.create(i)
        };
        this.active = true;
        this.position();
        var a = 5000;
        var t = window.GB_getLast && window.GB_getLast();
        if (t) {
            a = GB_getLast().cur_zindex + 5000
        }
        this.container.style.zIndex = a;
        if (this.with_arrow_top) {
            this.arrow_top.style.zIndex = a + 100
        }
    },
    position: function () {
        if (!this.container) {
            return
        }
        var c = absolutePosition(this.click_elm);
        if (hasClass(this.click_elm, "fixed_pos")) {
            c.y += getScrollTop()
        }
        var a = c.y + this.click_elm.offsetHeight + 9 + this.offset_y;
        var b = c.x - (this.container.offsetWidth / 2) + (this.click_elm.offsetWidth / 2) + this.offset_x;
        setTop(this.container, a);
        setLeft(this.container, b);
        if (this.with_arrow_top) {
            setWidth(this.arrow_top, this.container.offsetWidth)
        }
        FocusElm.focus(this.container, function () {
            if (MiniCal.click_elm.select) {
                MiniCal.click_elm.select()
            }
        })
    },
    remove: function () {
        this.click_elm = null;
        if (!this.container) {
            return
        }
        this.active = false;
        removeElement(this.container);
        this.container = null
    },
    setCurrent: function (c, d, a) {
        var b = MiniCal.genDate(c, parseInt(d) - 1, a);
        this.onSelect(b);
        this.setCurrentNoRender(b);
        this.remove()
    },
    setCurrentNoRender: function (b) {
        var c = b.getFullYear();
        var d = b.getMonth();
        var a = b.getDate();
        this.month = this.oldMonth = "" + (d);
        this.year = this.oldYear = c;
        this.day = a;
        this.oldDay = a
    },
    reset: function () {
        this.month = null;
        this.year = null;
        this.day = null;
        this.oldDay = null
    },
    _setDeltaDate: function (b) {
        var a = MiniCal.genDate(this.year, this.month, 1);
        if (a.getMonth() == 0 && b == -1) {
            a.setDate(1);
            a.setMonth(11);
            a.setFullYear(a.getFullYear() - 1);
            var d = new Date();
            d = d.getFullYear();
            if (a.getFullYear() < d) {
                return
            }
        } else {
            if (a.getMonth() == 11 && b == 1) {
                a.setDate(1);
                a.setMonth(0);
                a.setFullYear(a.getFullYear() + 1)
            } else {
                a.setDate(1);
                a.setMonth(a.getMonth() + b)
            }
        }
        this.year = a.getFullYear();
        this.month = "" + a.getMonth();
        this.day = a.getDate();
        var c = this.click_elm;
        this.remove();
        this.create(c)
    },
    selectPrevMonth: function () {
        MiniCal._setDeltaDate(-1);
        return false
    },
    selectNextMonth: function () {
        MiniCal._setDeltaDate(1);
        return false
    },
    genDate: function (c, d, a) {
        var b = new Date();
        b.setYear(parseInt(c));
        b.setDate(1);
        b.setMonth(parseInt(d));
        b.setDate(parseInt(a));
        return b
    }
};
MiniCal.create = $b(MiniCal.create, MiniCal);
Notifier = {
    shown: false,
    sticky: false,
    div_top: null,
    div_notifier: null,
    hide_link: A({
        href: "#",
        c: "hide_link",
        s: "float: right"
    }, _("Hide")),
    init: function () {
        this.hide_link.onclick = Notifier.hide;
        this.div_notifier = $("notifier");
        this.div_top = $("top");
        this.hide();
        this.position();
        appendToTop(this.div_notifier, this.hide_link)
    },
    position: function () {
        var c = $("notifier");
        if (c) {
            var a = getWindowSize();
            var b = (a.w - c.offsetWidth) / 2;
            setLeft(c, b)
        }
    },
    hide: function () {
        hideElement($("notifier"));
        Notifier.shown = false;
        return false
    },
    hideUnlessSticky: function () {
        if (!Notifier.sticky) {
            Notifier.hide()
        }
        return false
    },
    show: function (a, b) {
        if (isString(a)) {
            setHTML(this.div_notifier, a)
        } else {
            RCN(this.div_notifier, a)
        } if (b != true) {
            b = false
        }
        this.sticky = b;
        setVisibility(this.div_notifier, false);
        showElement(this.div_notifier);
        this.position();
        setVisibility(this.div_notifier, true);
        Notifier.shown = true
    }
};
AEV(window, "resize", Notifier.position);
AEV(window, "scroll", Notifier.position);
var GGSocialMedia;
GGSocialMedia = (function () {
    function a() {
        this.gaq_prefix = "";
        preloadImages("https://ssl.gstatic.com/s2/oz/images/stars/po/Publisher/sprite.png")
    }
    a.prototype.show = function (b, f) {
        var d, c;
        d = function (h) {
            var g, i;
            if (h.indexOf("twitter.com") !== -1) {
                g = true
            } else {
                g = false
            } if (h.indexOf("$url") !== -1) {
                h = h.replace(/\$url/g, g && b || urlencode(b))
            }
            if (g) {
                i = f.replace(b, "")
            } else {
                i = f
            }
            i = strip(i);
            if (h.indexOf("$text") !== -1) {
                i = i.replace(/\s/g, "+");
                i = i.replace(/\//g, "%2F");
                h = h.replace(/\$text/g, i)
            }
            return h
        };
        c = DIV({
            c: "social_media"
        }, this.genIcon(_("Share this page on Facebook"), "facebook", d("http://www.facebook.com/share.php?u=$url")), this.genIcon(_("Share this page on Twitter"), "twitter", d("http://www.twitter.com/share?text=$text&url=$url")), this.genIcon(_("Share this page on LinkedIn"), "linkedin", d("http://www.linkedin.com/shareArticle?mini=true&url=$url&title=$text&source=$url")), this.genIcon(_("Publicly +1 this"), "gplus", d("gplus")));
        ACN(getBody(), c);
        return setLeft(c, 10)
    };
    a.prototype.genIcon = function (f, g, d) {
        var h, c, b, i, j = this;
        h = "icon sm_off cmp_" + g + "_off";
        c = "icon sm_on cmp_" + g + "_on";
        b = imageSprite(h, 27, 27);
        i = A({
            href: d,
            target: "_blank"
        }, b);
        AEV(i, "click", function () {
            var k;
            k = window._gaq;
            if (k) {
                return k.push(["_trackEvent", "SocialMedia", "IconClick", "" + j.gaq_prefix + "_" + g])
            }
        });
        AEV(i, "mouseover", function (l) {
            var k;
            if (c.indexOf("gplus") !== -1) {
                swapDOM(b.parentNode, DIV({
                    s: "height: 29px"
                }, k = IMG({
                    src: "https://d3ptyyxy2at9ui.cloudfront.net/b5db1fca5b925aa148e6e79375b18ab8.gif",
                    c: "indi_img"
                }), DIV({
                    id: "g_plus_holder"
                })));
                ACN(getBody(), SCRIPT({
                    type: "text/javascript",
                    src: "https://apis.google.com/js/plusone.js"
                }));
                return window.gPlusInterval = setInterval(function () {
                    var m;
                    m = window.gapi && window.gapi.plusone;
                    if (m) {
                        removeElement(k);
                        gapi.plusone.render("g_plus_holder", {
                            size: "small",
                            href: location.href
                        });
                        return clearTimeout(window.gPlusInterval)
                    }
                }, 100)
            } else {
                setClass(b, c);
                return AmiTooltip.show(b, DIV({
                    c: "tooltip_cnt"
                }, f), l, -30, 38, true)
            }
        });
        AEV(i, "mouseout", function () {
            setClass(b, h);
            return AmiTooltip.hide(true)
        });
        return i
    };
    return a
})();
window.SocialMedia = new GGSocialMedia();
var GSocialMediaPages;
GSocialMediaPages = (function () {
    function a() {}
    a.prototype.genIcons = function (d) {
        var c, f, g, b;
        c = SPAN({
            c: "social_media_links"
        });
        for (g = 0, b = d.length; g < b; g++) {
            f = d[g];
            ACN(c, this.genIcon(f[0], f[1]))
        }
        return c
    };
    a.prototype.genIcon = function (f, d) {
        var g, c, b, h;
        g = "icon cmp_" + f + "_off";
        c = "icon cmp_" + f + "_on";
        b = imageSprite(g, 27, 27);
        h = A({
            href: d,
            target: "_blank"
        }, b);
        addClass(h, "social_media_link");
        AEV(h, "mouseover", function () {
            return setClass(b, c)
        });
        AEV(h, "mouseout", function () {
            return setClass(b, g)
        });
        return h
    };
    return a
})();
window.SocialMediaPages = new GSocialMediaPages();
var GViralSpread, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GViralSpread = (function () {
    function a() {
        this.show = __bind(this.show, this);
        this.showIfUnique = __bind(this.showIfUnique, this);
        this.countAndShowIfNeeded = __bind(this.countAndShowIfNeeded, this)
    }
    a.prototype.countAndShowIfNeeded = function () {
        var c, b, d;
        if (window.User.karma < 1000) {
            return
        }
        if ($storage("ViralSpreadDone").get()) {
            return
        }
        c = $storage("ViewCount").get();
        if (c) {
            d = c.split("-"), c = d[0], b = d[1];
            c = parseInt(c);
            b = parseInt(b)
        } else {
            c = 0;
            b = 3
        }
        c++;
        $storage("ViewCount").set("" + c + "-" + b);
        if (c > b) {
            return this.showIfUnique()
        }
    };
    a.prototype.showIfUnique = function () {
        var b, c = this;
        b = getRequest("/Tooltips/isSeen");
        b.addCallback(function (d) {
            if (d === "not_seen") {
                return c.show()
            } else {
                return $storage("ViralSpreadDone").set(1)
            }
        });
        return b.sendReq({
            name: "viral_spread"
        })
    };
    a.prototype.show = function () {
        var i, f, h, j, k, d, c, b, g = this;
        if (this.tooltip_shown) {
            return
        }
        k = _("If you enjoy using Todoist, would you mind taking a moment and telling others about it?") + "<br><br>" + _("It won't take more than some seconds. Thanks for your support!");
        i = Alerts.renderHolder(k);
        addClass(i.frame, "viral_holder");
        f = this.shareLink("facebook", "Facebook", "https://www.facebook.com/sharer/sharer.php?u=https://todoist.com/");
        j = this.shareLink("twitter", "Twitter", this.genTwitterLink());
        h = this.shareLink("gplus", "Google+", "https://plus.google.com/share?url=https://todoist.com/");
        ACN(i.buttons, BR(), f, j, h);
        ACN(i.buttons, BR(), BR(), BR());
        ACN(i.buttons, c = DIV(b = A({
            href: "#",
            c: "cancel"
        }, _("Remind me later")), d = A({
            href: "#",
            c: "cancel"
        }, _("No, Thanks"))));
        AEV([f, j, h], "click", function () {
            var l;
            g.disableTooltip();
            RCN(c, DIV(B(_("Thank you!"))), l = A({
                href: "#",
                c: "viral_link"
            }, _("Close")));
            return AEV(l, "click", GB_hide)
        });
        AEV(b, "click", this.remindMeLater);
        AEV(d, "click", this.disableTooltip);
        AEV([b, d], "click", GB_hide);
        GB_showHTML("", i.frame, 180, 300, {
            callback_fn: function () {
                if (!$storage("ViralSpreadDone").get()) {
                    return g.remindMeLater()
                }
            }
        });
        return this.tooltip_shown = true
    };
    a.prototype.disableTooltip = function () {
        $storage("ViralSpreadDone").set(1);
        return getRequest("/Tooltips/markAsSeen").sendReq({
            name: "viral_spread"
        })
    };
    a.prototype.remindMeLater = function () {
        return $storage("ViewCount").set("0-30")
    };
    a.prototype.shareLink = function (c, f, d) {
        var b;
        b = imageSprite("cmp_" + c, 16, 16);
        return A({
            href: d,
            target: "_blank",
            c: "viral_link"
        }, b, f)
    };
    a.prototype.genTwitterLink = function () {
        var b;
        b = _("Get more productive and organized with @Todoist. Sign up for free.");
        b += " https://todoist.com/";
        b = urlencode(b);
        return "https://twitter.com/home?status=" + b
    };
    return a
})();
window.ViralSpread = new GViralSpread();
var ResizingTextArea = new AJS.Class({
    init: function (c, f, b) {
        AJS.bindMethods(this);
        if (c) {
            this.arrows = c.arrows
        }
        this.holder = c;
        this.field = f;
        this.clone = AJS.DIV({
            "class": "auto_exapnd_clone"
        }, "-");
        AJS.ACN(AJS.getBody(), this.clone);
        AJS.addClass(f, "auto_exapnd");
        var g = "keypress";
        this.extra_h = 0;
        if (AJS.isIe() || isSafari()) {
            g = "keydown"
        }
        AJS.AEV(f, g, this.keyPress);
        AJS.AEV(f, "focus", this.resize);
        f.resize_textarea = this.resize;
        f.resize = this.resize;
        if (b != false) {
            this.escape_cr = true
        } else {
            this.escape_cr = false
        }
        try {
            var a = ProjectEditorManager.current_editor;
            this.current_indent = GenericManagerUtils.getIndent(a.current_item)
        } catch (d) {
            this.current_indent = 1
        }
    },
    keyPress: function (b) {
        setEditOn();
        var a = b.keyAscii;
        if (!b.alt && !b.meta && (a == 78 && b.ctrl || a == 110 && b.ctrl || a == 14 || a == 77 && b.ctrl || a == 109 && b.ctrl)) {
            LibEdit.insertAtCursor(this.field, "\n", true, false);
            this.resize();
            AJS.preventDefault(b);
            return false
        } else {
            this.resize()
        }
    },
    resize: function () {
        var b = this.field;
        var a = this.clone;
        if (b.clientHeight == 0) {
            return
        }
        a.style.width = b.offsetWidth + "px";
        var c = b.value.replace(/</g, "&gt;");
        c = c.replace(/\n\r?/g, "<br>--");
        if (c == "") {
            c = "T"
        }
        this.clone.innerHTML = c;
        if (a.offsetHeight != this.old_height) {
            var d = a.offsetHeight;
            b.style.height = (d + this.extra_h) + "px";
            if (this.arrows) {
                setTimeout(this.arrows.updateArrows, 10)
            }
            this.old_height = d
        }
    },
    remove: function () {
        removeElement(this.clone);
        this.clone = null;
        this.field = null
    }
});
var FiltersDefs, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
FiltersDefs = (function () {
    a.prototype.all_filters = [];

    function a() {
        this.createSearchSection = __bind(this.createSearchSection, this);
        var b = this;
        this.all_filters.push({
            name: _(""),
            query_match: /q:\s*(.+)/,
            filter_sections: function (c, d) {
                return b.createSearchSection(d[1])
            }
        });
        this.all_filters.push({
            name: _("No Priority"),
            query_match: /^p(?:riority)?\s*(4)|^no\s*pri(ority)?/,
            filter_items: function (c) {
                return FilterQueries.byFilter(c, 1)
            }
        });
        this.all_filters.push({
            name: "",
            name_fn: function (c) {
                return format(_("Priority %s"), parseInt(c[1]))
            },
            query_match: /^p(?:riority)?\s*(\d)/,
            filter_items: function (c, d) {
                var f;
                f = 5 - parseInt(d[1]);
                return FilterQueries.byFilter(c, f)
            }
        });
        this.all_filters.push({
            name: _("Your labels"),
            query_match: /^@$|labels/,
            filter_items: function (c) {
                return []
            },
            view: "labels"
        });
        this.all_filters.push({
            name: "",
            name_fn: function (c) {
                return c[0]
            },
            query_match: /^@([^\s]+)/,
            filter_items: function (c, f) {
                var d;
                d = LabelsModel.get(f[0].replace("@", "").toLowerCase());
                if (d) {
                    return FilterQueries.byLabel(c, d.id)
                } else {
                    return []
                }
            }
        });
        this.all_filters.push({
            name: _("Tasks with no due date"),
            query_match: /(no\s*dates?|no\s*due\s*dates?|without_dates?)/,
            filter_items: function (c) {
                return FilterQueries.byNoDueDate(c)
            }
        });
        this.all_filters.push({
            name: "",
            query_match: /^(od$|over\s*due|over\s*time)/,
            filter_items: function (c) {
                return FilterQueries.byOverdue(c)
            },
            view: "day_view_span"
        });
        this.all_filters.push({
            name: "",
            query_match: /^(\d|1\d)\s*days?$/,
            sections: function (c, d) {},
            filter_sections: function (h, g) {
                var i, c, d, l, k, m, f, j;
                l = parseInt(g[1]);
                d = FilterQueries.createDateSpan(l);
                m = [];
                for (f = 0, j = d.length; f < j; f++) {
                    i = d[f];
                    c = FilterQueries.byDate(h, i);
                    k = FilterHelpers.createSection("", c, "day_view_fixed");
                    k.day_date = i;
                    m.push(k)
                }
                return m
            }
        });
        this.all_filters.push({
            name: "",
            query_match: /(\d\d)\s*days?/,
            filter_items: function (d, f) {
                var g, c;
                g = parseInt(f[1]);
                c = FilterQueries.byDateSpan(d, g);
                return c
            },
            view: "day_view_span"
        });
        this.all_filters.push({
            name: "",
            query_match: /^va$|^view\sall/,
            filter_items: function (c, d) {
                return []
            },
            view: "view_all"
        });
        this.all_filters.push({
            name: "",
            query_match: /.+/,
            filter_sections: function (d, f) {
                var c, h, g, j, i;
                g = f[0];
                if (window.I18N_LANG) {
                    j = translate_to_english(I18N_LANG, LANG, g)
                } else {
                    j = g
                }
                h = DateBocks.magicDate(j);
                if (h !== -1) {
                    c = FilterQueries.byDate(d, h);
                    i = FilterHelpers.createSection("", c, "day_view_fixed");
                    i.day_date = h;
                    return i
                }
                return b.createSearchSection(g)
            }
        })
    }
    a.prototype.createSearchSection = function (b) {
        var c, d;
        d = QuerySearch.search(b);
        c = FilterHelpers.createSection(format(_("Search for `%s`"), b), d, "search");
        c.query = b;
        return c
    };
    return a
})();
window.FiltersDefs = FiltersDefs;
var GFilterQueries, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GFilterQueries = (function () {
    function a() {
        this.createDateSpan = __bind(this.createDateSpan, this);
        this.byOverdue = __bind(this.byOverdue, this)
    }
    a.prototype.byFilter = function (b, d) {
        var c;
        return (function () {
            var h, g, f;
            f = [];
            for (h = 0, g = b.length; h < g; h++) {
                c = b[h];
                if (c.priority === d) {
                    f.push(c)
                }
            }
            return f
        })()
    };
    a.prototype.byLabel = function (d, h, f) {
        var g, b, i, c;
        if (f == null) {
            f = false
        }
        b = [];
        for (i = 0, c = d.length; i < c; i++) {
            g = d[i];
            if (isIn(h, TemporaryIds.getRealIds(g.labels))) {
                b.push(g)
            }
        }
        return b
    };
    a.prototype.byNoDueDate = function (d) {
        var f, b, g, c;
        b = [];
        for (g = 0, c = d.length; g < c; g++) {
            f = d[g];
            if (!f.due_date) {
                b.push(f)
            }
        }
        return b
    };
    a.prototype.byOverdue = function (b) {
        b = ItemsQueries.getOverdue(b);
        return b
    };
    a.prototype.byDate = function (b, c) {
        return ItemsQueries.getByDate(c, b)
    };
    a.prototype.byDateSpan = function (f, j) {
        var d, i, g, b, h, c;
        i = DateController.dateMin(DateBocks.magicDate("today"));
        d = DateController.dateMax(DateBocks.magicDate("+" + j));
        b = [];
        for (h = 0, c = f.length; h < c; h++) {
            g = f[h];
            if (g.due_date) {
                if (DateController.betweenDates(i, d, g.due_date)) {
                    b.push(g)
                }
            }
        }
        b.sort(UtilModels.sortByDate);
        b.reverse();
        return b
    };
    a.prototype.createDateSpan = function (j) {
        var c, f, h, b, g, d;
        h = DateBocks.getNow();
        g = DateBocks.getNow();
        g.setDate(h.getDate() + j);
        c = [];
        for (b = d = 0; 0 <= j ? d <= j : d >= j; b = 0 <= j ? ++d : --d) {
            f = DateBocks.getNow();
            f.setDate(f.getDate() + b);
            c.push(f)
        }
        return c
    };
    return a
})();
window.FilterQueries = new GFilterQueries();
var GFilterHelpers, exports_obj, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GFilterHelpers = (function () {
    function a() {
        this.flattenSections = __bind(this.flattenSections, this);
        this.forceList = __bind(this.forceList, this);
        this.getItemIds = __bind(this.getItemIds, this)
    }
    a.prototype.createSection = function (d, c, b) {
        if (b == null) {
            b = "flat_view"
        }
        return {
            name: d,
            items: c,
            view: b
        }
    };
    a.prototype.getItemIds = function (k) {
        var b, l, i, g, f, j, c, h, d;
        b = {};
        h = this.forceList(k);
        for (g = 0, j = h.length; g < j; g++) {
            i = h[g];
            d = i.items;
            for (f = 0, c = d.length; f < c; f++) {
                l = d[f];
                b[l.id] = true
            }
        }
        return b
    };
    a.prototype.isArray = function (b) {
        return Object.prototype.toString.call(b) === "[object Array]"
    };
    a.prototype.forceList = function (b) {
        if (this.isArray(b)) {
            return b
        } else {
            return [b]
        }
    };
    a.prototype.flattenSections = function (g) {
        var b, d, f, c;
        b = [];
        for (f = 0, c = g.length; f < c; f++) {
            d = g[f];
            if (this.isArray(d)) {
                b = b.concat(d)
            } else {
                b.push(d)
            }
        }
        return b
    };
    return a
})();
if (typeof exports !== "undefined" && exports !== null) {
    exports_obj = exports
} else {
    exports_obj = window
}
exports_obj.FilterHelpers = new GFilterHelpers();
var FilterEngine, exports_obj, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
FilterEngine = (function () {
    a.prototype.re_set_op = /(\&|\|)/g;

    function a(b) {
        this.evaluteMinusOp = __bind(this.evaluteMinusOp, this);
        this.evaluteOrOp = __bind(this.evaluteOrOp, this);
        this.evaluteAndOp = __bind(this.evaluteAndOp, this);
        this.evaluateSetOperations = __bind(this.evaluateSetOperations, this);
        this.convertToSections = __bind(this.convertToSections, this);
        this.convertToTerms = __bind(this.convertToTerms, this);
        this.rewriteOperators = __bind(this.rewriteOperators, this);
        this.filterItems = __bind(this.filterItems, this);
        this.filter_defs_obj = b
    }
    a.prototype.filterItems = function (f, b) {
        var d, c;
        b = this.rewriteOperators(b);
        c = this.convertToTerms(b);
        d = this.convertToSections(f, c);
        d = this.evaluateSetOperations(d);
        d = FilterHelpers.flattenSections(d);
        return d
    };
    a.prototype.rewriteOperators = function (b) {
        var c;
        c = function (g, f, d) {
            if (f && (f !== "," && f !== "|" && f !== "&")) {
                return g.replace("@", "& @")
            }
            if (d && (d !== "," && d !== "|" && d !== "&")) {
                return g.replace(/\s+/, " & ")
            }
            return g
        };
        b = b.replace(/(?:(.)\s+@|@[^\s]+\s+(.))/g, c);
        return b
    };
    a.prototype.convertToTerms = function (m) {
        var k, q, i, l, g, r, p, c, o, h, f, n, b, j, d;
        l = function (s) {
            return s.replace(",", "~")
        };
        m = m.replace(/\([^)]+\)/g, l);
        r = [];
        j = m.split(",");
        for (h = 0, n = j.length; h < n; h++) {
            p = j[h];
            p = strip(p).replace(/~/g, ",");
            i = {};
            q = 1;
            g = function (s) {
                var t;
                q++;
                t = "~!" + q;
                i[t] = s;
                return t
            };
            p = p.replace(/\([^)]+\)/g, g);
            d = p.split(this.re_set_op);
            for (f = 0, b = d.length; f < b; f++) {
                c = d[f];
                if (c) {
                    for (k in i) {
                        o = i[k];
                        c = c.replace(k, o)
                    }
                    c = strip(c);
                    r.push(c)
                }
            }
        }
        return r
    };
    a.prototype.convertToSections = function (f, i) {
        var l, m, j, n, k, s, p, r, c, g, d, o, b, h;
        r = [];
        for (g = 0, o = i.length; g < o; g++) {
            c = i[g];
            p = null;
            if (c.indexOf("(") !== -1) {
                c = c.replace("(", "").replace(")", "");
                p = this.filterItems(f, c)
            } else {
                if (c.match(this.re_set_op)) {
                    r.push(c);
                    continue
                }
                j = false;
                if (c.indexOf("-") === 0 || c.indexOf("!") === 0) {
                    j = true;
                    c = strip(c.replace(/[-!]/, ""))
                }
                try {
                    if (c.indexOf("@") === -1) {
                        c = translate_to_english(I18N_FILTERS, "" + LANG + "_defs", c)
                    }
                } catch (q) {
                    l = q;
                    null
                }
                h = this.filter_defs_obj.all_filters;
                for (d = 0, b = h.length; d < b; d++) {
                    m = h[d];
                    k = c.match(m.query_match);
                    if (k) {
                        if (m.filter_sections) {
                            p = m.filter_sections(f, k)
                        } else {
                            n = m.filter_items(f, k);
                            s = m.name_fn;
                            if (s) {
                                m.name = s(k)
                            }
                            p = FilterHelpers.createSection(m.name, n, m.view)
                        }
                        break
                    }
                }
                if (!p) {
                    throw new Error(format("There was an error. Could not understand `%s`.", c))
                }
            } if (j) {
                p = this.evaluteMinusOp(f, p)
            }
            r.push(p)
        }
        return r
    };
    a.prototype.evaluateSetOperations = function (h) {
        var c, f, b, d, g;
        f = 0;
        while (true) {
            g = h[f];
            if (!g) {
                break
            }
            if (typeof g !== "string") {
                f += 1;
                continue
            }
            if (g.match(this.re_set_op)) {
                b = h[f - 1];
                d = h[f + 1];
                if (!b || !d) {
                    throw new Error(_("`%s` is badly placed. Please look at filtering help for examples.".replace("%s", g)))
                }
                if (g === "&") {
                    c = this.evaluteAndOp(b, d)
                } else {
                    c = this.evaluteOrOp(b, d)
                }
                h.splice(f - 1, 1);
                h.splice(f - 1, 1);
                h.splice(f - 1, 1);
                h.splice(f - 1, 0, c);
                f = f - 1;
                continue
            }
        }
        return h
    };
    a.prototype.evaluteAndOp = function (b, d) {
        var m, g, o, n, f, k, j, p, c, l, h;
        d = FilterHelpers.forceList(d);
        n = d[0]["name"];
        f = FilterHelpers.getItemIds(d);
        l = FilterHelpers.forceList(b);
        for (k = 0, p = l.length; k < p; k++) {
            g = l[k];
            o = [];
            h = g.items;
            for (j = 0, c = h.length; j < c; j++) {
                m = h[j];
                if (f[m.id]) {
                    o.push(m)
                }
            }
            g.items = o;
            if (n) {
                g.name = "" + g.name + " & " + n
            }
            g.is_filtered = true
        }
        return b
    };
    a.prototype.evaluteOrOp = function (c, f) {
        var q, o, i, n, r, l, k, h, p, d, b, m, j, g;
        m = FilterHelpers.forceList(f);
        for (l = 0, p = m.length; l < p; l++) {
            r = m[l];
            j = FilterHelpers.forceList(c);
            for (k = 0, d = j.length; k < d; k++) {
                i = j[k];
                n = FilterHelpers.getItemIds(i);
                o = i.items;
                g = r.items;
                for (h = 0, b = g.length; h < b; h++) {
                    q = g[h];
                    if (!n[q.id]) {
                        o.push(q)
                    }
                }
                if (r.name) {
                    i.name = "" + i.name + " | " + r.name
                }
                i.is_filtered = true
            }
        }
        return c
    };
    a.prototype.evaluteMinusOp = function (d, l) {
        var m, j, i, c, g, f, k, b, h;
        h = FilterHelpers.forceList(l);
        for (g = 0, k = h.length; g < k; g++) {
            i = h[g];
            c = FilterHelpers.getItemIds(i);
            j = [];
            for (f = 0, b = d.length; f < b; f++) {
                m = d[f];
                if (!c[m.id]) {
                    j.push(m)
                }
            }
            i.items = j;
            i.name = "-" + i.name;
            i.is_filtered = true
        }
        return l
    };
    return a
})();
if (typeof exports !== "undefined" && exports !== null) {
    exports_obj = exports
} else {
    exports_obj = window
}
exports_obj.FilterEngine = FilterEngine;
var GTodoistFilterEngine, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GTodoistFilterEngine = (function () {
    function a() {
        this.filter = __bind(this.filter, this);
        var b;
        b = new FiltersDefs();
        this.engine = new FilterEngine(b)
    }
    a.prototype.filter = function (c) {
        var b, d;
        b = ItemsModel.getAll();
        d = this.engine.filterItems(b, c);
        return d
    };
    return a
})();
window.TodoistFilterEngine = new GTodoistFilterEngine();
var GCompletedHistory, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GCompletedHistory = (function () {
    function a() {
        this.toggleVisualize = __bind(this.toggleVisualize, this);
        this.renderBlankState = __bind(this.renderBlankState, this);
        this._renderDateItems = __bind(this._renderDateItems, this);
        this.renderItems = __bind(this.renderItems, this);
        this.showHistory = __bind(this.showHistory, this);
        this.renderLink = __bind(this.renderLink, this);
        this.renderCounter = __bind(this.renderCounter, this);
        this.renderKarma = __bind(this.renderKarma, this);
        this.updateCount = __bind(this.updateCount, this);
        this.karmaUpdated = __bind(this.karmaUpdated, this)
    }
    a.prototype._c_shades = {
        0: "ffffff",
        1: "f9feef",
        2: "f1fcda",
        3: "e6f9be",
        4: "dcf7a3",
        5: "d4f58c",
        6: "cbf275"
    };
    a.prototype._c_shades_mini = {
        0: "f5f5f5",
        1: "eff4e4",
        2: "e8f4cf",
        3: "e0f3b8",
        4: "d8f29f",
        5: "d1f287",
        6: "c9f274"
    };
    a.prototype.current_karma = null;
    a.prototype.karmaUpdated = function () {
        var d, b, c;
        d = $("s_completed_count");
        c = window.User;
        if (d && !window.User.karma_disabled) {
            b = c.karma;
            if (this.current_karma !== b) {
                RCN(d, this.renderKarma());
                this.highlightCount();
                return this.current_karma = b
            }
        }
    };
    a.prototype.updateCount = function (d) {
        var c, b;
        this.current_count = d;
        if (!window.User.karma_disabled) {
            RCN($("s_completed_count"), this.renderKarma());
            return
        }
        c = $("s_completed_count").innerHTML;
        b = true;
        if (c === "-") {
            b = false
        } else {
            if (parseInt(c) === d) {
                b = false
            }
        }
        RCN($("s_completed_count"), "" + d);
        if (b) {
            return this.highlightCount()
        }
    };
    a.prototype.highlightCount = function () {
        var b;
        if (window.IS_MINI) {
            b = this._c_shades_mini
        } else {
            b = this._c_shades
        }
        return AJS.fx.highlight($("completed_items"), {
            duration: 2500,
            onComplete: function () {
                return $("completed_items").style.backgroundColor = ""
            }
        }, b)
    };
    a.prototype.renderKarma = function () {
        var c, d, b;
        b = window.User;
        this.current_karma = b.karma;
        c = SPAN();
        ACN(c, getKarmaImage(b.karma));
        if (b.karma_trend === "up") {
            ACN(c, imageSprite("cmp_karma_up", 11, 9))
        } else {
            if (b.karma_trend === "down") {
                ACN(c, imageSprite("cmp_karma_down", 11, 9))
            }
        }
        ACN(c, d = SPAN("" + b.karma));
        return c
    };
    a.prototype.renderCounter = function () {
        return RCN($("completed_items"), this.renderLink())
    };
    a.prototype.renderLink = function () {
        var b;
        if (!window.User.karma_disabled) {
            b = A({
                href: "#completed",
                c: "fixed_pos"
            }, SPAN({
                id: "s_completed_count"
            }, "-"))
        } else {
            b = A({
                href: "#completed",
                c: "fixed_pos"
            }, SPAN({
                id: "s_completed_count"
            }, "-"), " ", _("completed"))
        }
        CompletedQuickVisualize.attach(b);
        return b
    };
    a.prototype.showHistory = function (l) {
        var o, q, r, c, n, m, b, f, s, j, i, h, p, d, k, g;
        if (l == null) {
            l = false
        }
        CompletedQuickVisualize.hide();
        ProjectEditorManager.reset();
        InfoPage.hide();
        ProjectList.deselectCurrent();
        if (l === true) {
            this.visualize_on = true
        }
        m = SELECT({
            id: "select_project"
        }, OPTION({
            value: ""
        }, _("Any project")), OPTION({
            disabled: "disabled"
        }, "---------"));
        k = ProjectsModel.getAll();
        for (i = 0, p = k.length; i < p; i++) {
            r = k[i];
            ACN(m, OPTION({
                value: r.id
            }, r.name))
        }
        n = SELECT({
            id: "select_label"
        }, OPTION({
            value: ""
        }, _("Any label")), OPTION({
            disabled: "disabled"
        }, "---------"));
        g = values(LabelsModel.getAll());
        for (h = 0, d = g.length; h < d; h++) {
            q = g[h];
            ACN(n, OPTION({
                value: q.name
            }, q.name))
        }
        c = SELECT({
            id: "select_days"
        }, OPTION({
            value: ""
        }, _("Past 2 weeks")), OPTION({
            value: "past month"
        }, _("Past Month")), OPTION({
            value: "past 6 months"
        }, _("Past 6 Months")), OPTION({
            disabled: "disabled"
        }, "---------"), OPTION({
            value: "all"
        }, _("Any time")));
        if (this.visualize_on) {
            s = "cmp_visualize_on"
        } else {
            s = "cmp_visualize_off"
        } if (window.IS_MINI) {
            j = null
        } else {
            j = _("Visualize")
        }
        f = A({
            href: "#",
            c: "action visualize"
        }, b = imageSprite(s, 16, 16), j);
        AEV(f, "click", $p(this.toggleVisualize, f, b));
        AEV([c, n, m], "change", this.renderItems);
        o = DIV({
            id: "completed_app"
        }, DIV({
            c: "filters"
        }, f, c, m, n), DIV({
            id: "completed_show"
        }));
        RCN($("editor"), o);
        this.renderItems();
        return false
    };
    a.prototype.renderItems = function () {
        var f, c, b, d = this;
        if (this.visualize_on) {
            LocationManager.updateLocation("completed_visual")
        } else {
            LocationManager.updateLocation("completed")
        }
        RCN($("completed_show"), IMG({
            src: "https://d3ptyyxy2at9ui.cloudfront.net/fb947b5107ee9a4cbb1a7299459d46ae.gif"
        }));
        c = loadJSON("/CompletedHistory/get");
        c.offline_message = true;
        b = {};
        f = function (i, h) {
            var g;
            g = getSelectValue($(i));
            if (g) {
                return b[h] = g
            }
        };
        b.known_projects = serializeJSON(ProjectsModel.getIds());
        f("select_project", "project_id");
        f("select_days", "interval");
        f("select_label", "label");
        c.addCallback(function (m) {
            var i, k, j, l, h, g;
            if (m.projects) {
                d.project_by_id = m.projects
            } else {
                d.project_by_id = {}
            }
            k = $("completed_show");
            if (!window.IsPremium) {
                return RCN(k, d.renderBlankState(m.items.length))
            } else {
                if (d.visualize_on) {
                    return CompletedVisualize.render(m)
                } else {
                    if (values(b).length !== 0 && m.items.length === 0) {
                        return RCN(k, SPAN({
                            c: "light_error"
                        }, _("No completed tasks matches your filter.")))
                    } else {
                        if (m.items.length === 0) {
                            return RCN(k, d.renderBlankState(m.items.length))
                        } else {
                            j = d._splitIntoDays(m.items);
                            RCN(k, "");
                            g = [];
                            for (l = 0, h = j.length; l < h; l++) {
                                i = j[l];
                                g.push(d._renderDateItems(k, i))
                            }
                            return g
                        }
                    }
                }
            }
        });
        c.addErrback(function (h, g) {
            return RCN($("completed_app"), getOfflineMessage(g))
        });
        return c.sendReq(b)
    };
    a.prototype._renderDateItems = function (i, c) {
        var o, n, s, p, q, j, g, h, m, d, k, r, f, l, b, t;
        s = c.date;
        j = c.items;
        ACN(i, RenderQueryDays._renderDayHeader(s, false));
        l = UL({
            c: "items"
        });
        for (b = 0, t = j.length; b < t; b++) {
            q = j[b];
            f = SPAN({
                c: "complete_time"
            }, DateController.getHourAndMin(q.completed_date, Settings.AMPM));
            r = null;
            d = ProjectsModel.get(q.project_id) || this.project_by_id[q.project_id];
            if (d) {
                r = ItemsRender.createProjectItem({
                    project_id: d.id
                })
            }
            p = imageSprite("cmp_trash", 16, 16);
            setVisibility(p, false);
            h = LI({
                c: "task_item"
            }, f, r, p, o = SPAN());
            k = function (u, v) {
                return setVisibility(u, v)
            };
            AEV(p, "click", $p(this.deleteTask, h, q.id));
            AEV(h, "mouseover", $p(k, p, true));
            AEV(h, "mouseout", $p(k, p, false));
            n = Formatter.format(q.content);
            n = Labels.formatByContent(n);
            setHTML(o, n);
            m = Notes._renderIcon(q, h);
            g = $gc(o, "div", "labels_holder");
            if (g) {
                insertBefore(m, g)
            } else {
                ACN(o, m)
            }
            ACN(l, h)
        }
        ACN(i, l);
        return ACN(i, UL({
            c: "separator"
        }))
    };
    a.prototype.deleteTask = function (b, c) {
        var d;
        d = function (g) {
            var f;
            if (!g) {
                return
            }
            hideElement(b);
            f = getRequest("/CompletedHistory/deleteEntry");
            f.offline_message = true;
            f.addCallback(function () {
                removeElement(b);
                return Agenda.updateCounters()
            });
            f.addErrback(function () {
                return showElement(b)
            });
            return f.sendReq({
                entry_id: c
            })
        };
        return Alerts.confirm(_("Are you sure you want to delete this completed task?"), d)
    };
    a.prototype._splitIntoDays = function (d) {
        var k, f, j, g, b, h, c;
        j = function (n, l) {
            var q, m, p;
            m = d[l + 1];
            if (m) {
                q = n;
                p = m.completed_date;
                return q.getDate() === p.getDate() && q.getMonth() === p.getMonth() && q.getYear() === p.getYear()
            } else {
                return false
            }
        };
        b = [];
        k = [];
        for (f = h = 0, c = d.length; h < c; f = ++h) {
            g = d[f];
            k.push(g);
            if (!j(g.completed_date, f)) {
                b.push({
                    items: k,
                    date: g.completed_date
                });
                k = []
            }
        }
        return b
    };
    a.prototype.renderBlankState = function (f) {
        var b, c, d;
        if (!window.IsPremium) {
            d = _("Completed view is a premium feature")
        } else {
            d = _("You don't have any completed tasks")
        }
        b = DIV({
            c: "blank_state_text blank_state_completed"
        }, imageSprite("cmp_blank_completed", 55, 55, "blank_state_image"), B(d), DIV(_("Completed view makes it possible to see what you have done in the past."), " ", _("It's the perfect tool to review and improve your productivity."), " ", c = A({
            href: "/Help/viewTrackProducitivty",
            c: "action"
        }, _("Read more") + "...")));
        AEV(c, "click", function () {
            return top.GB_show(_("Track your productivity"), c.href, 550, 750)
        });
        if (!window.IsPremium) {
            ACN(b, DIV({
                c: "premium_only"
            }, DIV({
                c: "text"
            }, setHTML(SPAN(), _("<a>Upgrade to Todoist Premium for instant access</a> to this and a lot of other features").replace("<a>", '<a href="/PremiumLanding/show" onclick="return top.WindowOpener.showPrefs(\'premium\');">')))))
        }
        return b
    };
    a.prototype.toggleVisualize = function (b, c) {
        if (hasClass(c, "cmp_visualize_off")) {
            this.visualize_on = true;
            addClass(c, "frozen");
            replaceClass(c, "cmp_visualize_off", "cmp_visualize_on")
        } else {
            this.visualize_on = false;
            removeClass(c, "frozen");
            replaceClass(c, "cmp_visualize_on", "cmp_visualize_off")
        }
        CompletedHistory.renderItems();
        return false
    };
    return a
})();
Signals.connect("karma_updated sync_state_changed", function () {
    return CompletedHistory.karmaUpdated()
});
Signals.connect("item_completed item_uncompleted", function (a) {
    User.completed_count = User.completed_count + a;
    return CompletedHistory.updateCount(User.completed_count)
});
window.CompletedHistory = new GCompletedHistory();
var GCompletedVisualize, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GCompletedVisualize = (function () {
    function a() {
        this._getProjectGraph = __bind(this._getProjectGraph, this);
        this._getDayGraph = __bind(this._getDayGraph, this);
        this._getProductivityTrend = __bind(this._getProductivityTrend, this);
        this.render = __bind(this.render, this)
    }
    a.prototype.render = function (c) {
        var b;
        b = $("completed_show");
        RCN(b, null);
        ACN(b, this._getProductivityTrend(c));
        ACN(b, BR(), BR());
        ACN(b, this._getProjectGraph(c));
        ACN(b, BR(), BR());
        return ACN(b, this._getDayGraph(c))
    };
    a.prototype._getProductivityTrend = function (h) {
        var l, d, m, j, f, i, b, c, n, g, k;
        n = this.getSize(300);
        c = 0;
        f = CompletedHistory._splitIntoDays(h.items);
        l = [];
        i = [];
        for (g = 0, k = f.length; g < k; g++) {
            m = f[g];
            b = m.items.length;
            l.push(b);
            d = m.date;
            i.push(d.getDate());
            c = Math.max(c, b)
        }
        l.reverse();
        i.reverse();
        if (i.length < 32 && !window.IS_MINI) {
            i = "&chl=" + i.join("|")
        } else {
            i = ""
        }
        l = l.join(",");
        j = "https://todoist.com/chart\n?chxr=0,0," + c + "\n&chxt=y\n&chbh=a\n&chs=" + n + "\n&cht=bvg\n&chco=000000\n&chds=0," + c + "\n&chd=t:" + l + "\n" + i;
        return DIV(H2({
            c: "section_header"
        }, _("Productivity trend")), this.wrap(IMG({
            src: j,
            s: "margin: 10px 0 0 20px"
        }), j))
    };
    a.prototype._getDayGraph = function (i) {
        var k, o, m, l, p, b, j, q, d, g, f, c, n, h;
        d = {};
        for (j = g = 0; g <= 6; j = ++g) {
            d[j] = 0
        }
        h = i.items;
        for (f = 0, n = h.length; f < n; f++) {
            p = h[f];
            m = p.completed_date.getDay();
            d[m] += 1
        }
        q = this.getSize(300);
        b = 0;
        for (m in d) {
            k = d[m];
            b = Math.max(b, k)
        }
        o = [];
        o.push(d[1]);
        for (j = c = 2; c <= 6; j = ++c) {
            o.push(d[j])
        }
        o.push(d[0]);
        o = o.join(",");
        l = "https://todoist.com/chart\n?chxr=0,0," + b + "\n&chxt=y\n&chbh=a\n&chs=" + q + "\n&cht=bvg\n&chco=000000\n&chds=0," + b + "\n&chd=t:" + o + "\n&chl=M|T|W|T|F|S|S";
        return DIV(H2({
            c: "section_header"
        }, _("By weekday")), this.wrap(IMG({
            src: l,
            s: "margin: 10px 0 0 20px"
        }), l))
    };
    a.prototype._getProjectGraph = function (i) {
        var f, b, l, p, n, r, k, c, j, q, s, m, d, g, o, h;
        d = {};
        h = i.items;
        for (g = 0, o = h.length; g < o; g++) {
            r = h[g];
            m = r.project_id;
            if (d[m]) {
                d[m] += 1
            } else {
                d[m] = 1
            }
        }
        c = 0;
        s = this.getSize(350);
        p = [];
        k = [];
        b = [];
        for (j in d) {
            l = d[j];
            q = ProjectsModel.get(j);
            if (q) {
                c = Math.max(c, l);
                p.push(l);
                k.push(q.name.replace("|", "-").replace(/[#\?&]/g, ""));
                f = ProjectColors[q.color] || "#dddddd";
                f = f.replace("#", "");
                b.push(f)
            }
        }
        p = p.join(",");
        k = k.join("|");
        b = b.join("|");
        n = "https://todoist.com/chart\n?chs=" + s + "\n&cht=p\n&chds=0," + c + "\n&chd=t:" + p + "\n&chl=" + k + "\n&chco=" + b;
        return DIV(H2({
            c: "section_header"
        }, _("By project")), this.wrap(IMG({
            src: n
        }), n))
    };
    a.prototype.wrap = function (b, c) {
        var g, f, d;
        d = window.IS_MINI && 350 || 500;
        c = c.replace("" + d + "x350", "500x400");
        c = c.replace("" + d + "x250", "500x300");
        f = "Todoist.com Productivity";
        g = window.User.fullname;
        if (g) {
            g = g.split(" ")[0];
            g = g.replace('"', "").replace("'", "");
            f = g + "'s " + f
        }
        c = c + "\n&chtt=" + f;
        return A({
            href: c,
            target: "_blank"
        }, b)
    };
    a.prototype.getSize = function (b) {
        var c;
        if (b == null) {
            b = 350
        }
        b -= 100;
        c = window.IS_MINI && 350 || 500;
        return "" + c + "x" + b
    };
    return a
})();
window.CompletedVisualize = new GCompletedVisualize();
var GCompletedQuickVisualize, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GCompletedQuickVisualize = (function () {
    function a() {
        this.getProjectColor = __bind(this.getProjectColor, this);
        this._renderData = __bind(this._renderData, this);
        this._renderKarmaInfo = __bind(this._renderKarmaInfo, this);
        this._renderTotalStats = __bind(this._renderTotalStats, this);
        this.renderData = __bind(this.renderData, this);
        this.show = __bind(this.show, this);
        this.attach = __bind(this.attach, this)
    }
    a.prototype.full_width = 252;
    a.prototype.attach = function (b) {
        var c = this;
        return AEV(b, "click", function () {
            c.show(b);
            return false
        })
    };
    a.prototype.hide = function () {
        if (this.cur_window) {
            return GB_hide()
        }
    };
    a.prototype.show = function (g, f) {
        var c, b, d, h = this;
        if ($bytc("div", "completed_quick_viz").length > 0) {
            return this.hide()
        }
        c = DIV({
            c: "completed_quick_viz"
        }, Indicator.imgSmall());
        b = function () {
            var j, i;
            i = window.User;
            j = loadJSON("/CompletedHistory/getQuickNumbers");
            j.addCallback(function (k) {
                h.renderData(k, c);
                window.User.karma = k.karma;
                window.User.karma_trend = k.karma_trend;
                return Signals.sendSignal("karma_updated")
            });
            j.addErrback(h.hide);
            return j.sendReq()
        };
        setTimeout(b, 200);
        d = {
            fn_left_offset: function (k, j) {
                var i;
                i = getWindowSize();
                return i.w - j.width - 80
            },
            fn_top_offset: function () {
                var i;
                i = absolutePosition($("completed_items")).y;
                return i + 25
            },
            fn_arrow_left: function () {
                var i;
                i = absolutePosition($("completed_items")).x;
                return i + 21
            },
            fixed_pos: true
        };
        return TooptipWin.show(_("Productivity trend"), c, 200, 275, d)
    };
    a.prototype.renderData = function (d, b) {
        var c;
        RCN(b, null);
        this.data_project_colors = d.project_colors;
        if (!window.User.karma_disabled) {
            ACN(b, this._renderKarmaInfo(d))
        }
        ACN(b, this._renderTotalStats(d));
        c = {
            str_caption: _("Productivity the last %s days").replace("%s", "7")
        };
        this._renderData(d.days_items, b, c);
        if (window.IsPremium || window.NATIVE_APP !== "mac_store") {
            c = {
                str_caption: _("Productivity the last %s weeks").replace("%s", "4"),
                check_premium: true
            };
            return this._renderData(d.week_items, b, c)
        }
    };
    a.prototype._renderTotalStats = function (d) {
        var c, b;
        c = DIV(H2(_("Completed history")));
        ACN(c, DIV({
            c: "completed_history_holder"
        }, b = A({
            href: "#completed"
        }, _("View All Completed")), B(CompletedHistory.current_count || "0"), " ", _("completed")));
        AEV(b, "click", function () {
            GB_hide();
            return CompletedHistory.showHistory()
        });
        return c
    };
    a.prototype._renderKarmaInfo = function (g) {
        var d, h, c, f, b;
        f = null;
        c = g.karma_last_update;
        if (c !== void 0) {
            if (c > 0) {
                b = _("%s on last update!");
                c = "+" + c
            } else {
                if (c < 0) {
                    b = _("%s on last update!")
                } else {
                    b = _("No change on last update!")
                }
            }
            f = setHTML(SPAN({
                c: "desc"
            }), b.replace("%s", "<b>" + c + "</b>"))
        }
        d = DIV(H2(f, _("Karma Trend")));
        ACN(d, IMG({
            src: g.karma_graph,
            width: 255,
            height: 70
        }));
        ACN(d, h = A({
            href: "#"
        }, _("Todoist Karma Help")));
        AEV(h, "click", WindowOpener.showKarmaInfo);
        return d
    };
    a.prototype._renderData = function (w, N, y) {
        var z, G, T, v, u, R, C, E, r, f, q, t, c, d, S, x, p, b, m, Q, D, O, M, L, K, s, l, k, j, i, h, g, J, I, H, F, o, n;
        T = DIV(H2(y.str_caption));
        ACN(T, D = UL());
        if (y.check_premium && !window.IsPremium) {
            ACN(D, LI({
                c: "promo"
            }, f = A({
                href: "#"
            }, _("Upgrade now")), _("Only available for premium.")));
            AEV(f, "click", $p(WindowOpener.showPrefs, "premium"));
            ACN(N, T);
            return false
        }
        R = {};
        q = 0;
        for (O = 0, s = w.length; O < s; O++) {
            C = w[O];
            q = Math.max(C.total_completed, q)
        }
        t = this.full_width / 100;
        for (M = 0, l = w.length; M < l; M++) {
            C = w[M];
            if (q === 0) {
                R[C.date] = 0
            } else {
                R[C.date] = Math.floor(t * (C.total_completed / q) * 100)
            }
        }
        p = {};
        for (L = 0, k = w.length; L < k; L++) {
            C = w[L];
            Q = R[C.date];
            t = Q / 100;
            F = C.items;
            for (K = 0, j = F.length; K < j; K++) {
                c = F[K];
                r = "" + C.date + "-" + c.id;
                p[r] = Math.floor(t * (c.completed / C.total_completed) * 100)
            }
        }
        m = function (U) {
            return parseInt(U.replace(/^0/, ""))
        };
        E = function (V) {
            var U;
            V = V.split("-");
            U = new Date(m(V[0]), m(V[1]) - 1, m(V[2]));
            return DateController.formatDate(U, true, false)
        };
        for (J = 0, i = w.length; J < i; J++) {
            C = w[J];
            if (C.date.indexOf("/") === -1) {
                b = E(C.date)
            } else {
                o = C.date.split("/"), v = o[0], u = o[1];
                v = E(v);
                u = E(u);
                b = v + " → " + u
            }
            S = DIV({
                c: "project_colors"
            });
            if (C.items.length === 0) {
                ACN(S, DIV({
                    c: "project_viz",
                    s: "width: 1px"
                }))
            }
            G = [];
            n = C.items;
            for (I = 0, h = n.length; I < h; I++) {
                c = n[I];
                c = ProjectsModel.get(c.id) || c;
                r = "" + C.date + "-" + c.id;
                x = p[r];
                if (x) {
                    d = this.getProjectColor(c, x);
                    G.push(d)
                }
            }
            G.sort(function (V, U) {
                return V.color - U.color
            });
            for (H = 0, g = G.length; H < g; H++) {
                z = G[H];
                ACN(S, z)
            }
            ACN(D, LI(B("" + C.total_completed), " • " + b, S))
        }
        return ACN(N, T)
    };
    a.prototype.getProjectColor = function (f, d) {
        var b, c;
        if (d == null) {
            d = 5
        }
        c = DIV({
            c: "project_viz"
        });
        b = f.color;
        if (b === void 0 && this.data_project_colors) {
            b = this.data_project_colors[f.id]
        }
        if (b !== void 0) {
            setStyle(c, {
                backgroundColor: ProjectColors[b] || "#dddddd",
                width: d
            })
        } else {
            setStyle(c, {
                backgroundColor: "#ffffff",
                width: d
            })
        }
        c.color = b || 0;
        return c
    };
    return a
})();
window.CompletedQuickVisualize = new GCompletedQuickVisualize();
var getKarmaClass, getKarmaImage;
getKarmaImage = function (a) {
    return imageSprite("karma_vis cmp_" + (getKarmaClass(a)), 16, 16)
};
getKarmaClass = function (a) {
    if (a < 2500) {
        return "k_beginner"
    } else {
        if (a >= 2500 && a < 5000) {
            return "k_intermediate"
        } else {
            if (a >= 5000 && a < 7500) {
                return "k_expert"
            } else {
                if (a >= 7500 && a < 10000) {
                    return "k_master"
                } else {
                    return "k_enlightened"
                }
            }
        }
    }
};
Formatter = {
    tag: "<%(tag)>%(text)</%(tag)>",
    re_email: /(^|\s+)(([a-zA-Z0-9_\.\-+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)/g,
    init: function () {
        var b = ["b", "del", "center", "i", "u", "big", "small", "strong", "em", "s", "strike"];
        var a = [];
        map(b, function (d) {
            var c = [new RegExp("&lt;" + d + "&gt;", "g"), "<" + d + ">", new RegExp("&lt;/" + d + "&gt;", "g"), "</" + d + ">"];
            a.push(c)
        });
        this.tags_to_enable = a
    },
    isAhref: function (a, b) {
        if (b.indexOf('<a href="' + a) != -1) {
            return true
        } else {
            return false
        }
    },
    format: function (h, l) {
        if (!l) {
            l = false
        }
        h = h.replace(/&/g, "&amp;");
        h = h.replace(/</g, "&lt;");
        h = h.replace(/>/g, "&gt;");
        h = h.replace(/!chains/g, "");
        h = h.replace(/!!\s*((?!!!).+?)\s*!!/g, "<b>$1</b>");
        h = h.replace(/__\s*((?!__).+?)\s*__/g, "<i>$1</i>");
        map(Formatter.tags_to_enable, function (u) {
            h = h.replace(u[0], u[1]);
            h = h.replace(u[2], u[3])
        });
        h = h.replace(/&lt;br\s*\/?&gt;/g, "<br>");
        var c = function (v, u, E, D, C, z, y) {
            if (D) {
                var F = '<a href="' + C + '" class="ex_link" target="_blank" onclick="return linkRedirecter(this)">' + z + "</a>";
                if (C.indexOf("d1x0mwiac2rqwt.cloudfront.net") != -1) {
                    var w = '<img src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif" class="cmp_attachment" width="16" />';
                    F = w + " " + F
                }
                if (C.indexOf("wedoist.com") != -1) {
                    F = "<b>WD</b> " + F
                }
                return F
            } else {
                if (y) {
                    var x = v;
                    if (x.length > 35) {
                        x = x.substring(0, 35) + "..."
                    }
                    if (v.indexOf("www") == 0) {
                        v = "http://" + v
                    }
                    if (Formatter.isAhref(v, h)) {
                        return v
                    }
                    return '<a href="' + v + '" class="ex_link" target="_blank" onclick="return linkRedirecter(this)">' + x + "</a>"
                } else {
                    if (E.indexOf("http") != 0 && E.indexOf("file://") != 0 && E.indexOf("ftp://") != 0) {
                        E = "http://" + E
                    }
                    if (Formatter.isAhref(E, h)) {
                        return E
                    }
                    return '<a href="' + E + '" class="ex_link" target="_blank" onclick="return linkRedirecter(this)">' + u + "</a>"
                }
            }
        };
        h = h.replace(/"([^"]+?)":[\[\(](.+?)[\)\]]|(((?:https?|ftp|file):\/\/[^\s]+)\s+[\[\(]([^\)]+)[\]\)])|((?:https?|ftp|evernote|file):\/\/|www\.)[^\s\]\)]+/g, c);
        var b = /[bui]{1,3}/gi;
        var q = function (y, x, w) {
            var v = x.match(b);
            if (v) {
                var u = w;
                map(v[0].split(""), function (z) {
                    u = RND(Formatter.tag, {
                        tag: z,
                        text: u
                    })
                });
                return u
            } else {
                if (x == "hl") {
                    return '<span class="hl">' + w + "</span>"
                }
            }
            return y
        };
        h = h.replace(/%\((.+?)\)\s*([^%]+?)%/g, q);
        h = h.replace(/^\*\s*/, "");
        if (!l) {
            var o = h.match(/\[\[gmail=(.+?),\s*(.+?)\]\]/);
            if (o) {
                var g = o[0];
                var j = o[1];
                var d = "https://mail.google.com";
                var p = false;
                if (j.indexOf("@") != -1) {
                    var m = j.split("@");
                    j = m[0];
                    var t = m[1];
                    p = !isIn(t, ["gmail", "mail"]);
                    if (p) {
                        d += "/a/" + t
                    } else {
                        d += "/mail/u/0"
                    }
                } else {
                    d += "/mail"
                }
                d = d.replace("mail.google.com/a/googlemail.com", "googlemail.com");
                var r = o[2];
                r = r.replace(/<[^biu].*?>/g, "");
                var s = '<img src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif" class="cmp_email_on" width="16" />';
                d += "/#inbox/" + j;
                var f = s + ' <a href="' + d + '" class="ex_link" target="_blank" onclick="return linkRedirecter(this)">' + r + "</a>";
                h = h.replace(g, f)
            }
        }
        if (!l) {
            var i = h.match(/\[\[thunderbird\n([^\n]+)\n([^\n]+)\n\]\]/);
            if (i) {
                var g = i[0];
                var k = i[2];
                var r = i[1];
                k = strip(k);
                r = strip(r);
                var s = '<img src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif" class="cmp_email_on" width="16" />';
                var f = s + ' <a thunder_id="' + k.replace('"', "") + '" href="#openThunderbird" class="ex_link" onclick="return linkRedirecter(this)">' + r + "</a>";
                h = h.replace(g, f)
            }
        }
        if (!l) {
            var n = h.match(/\[\[outlook=(.+?),\s*(.+?)\]\]/);
            if (n) {
                var g = n[0];
                var k = n[1];
                var r = n[2];
                var s = '<img src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif" class="cmp_email_on" width="16" />';
                var f = s + ' <a href="#openOutlook/' + k + '" class="ex_link" >' + r + "</a>";
                h = h.replace(g, f)
            }
        }
        var a = function (w, v, u) {
            if (v.indexOf("href=") != -1 || v.indexOf("ftp://") != -1 || v.indexOf("thunder_id") != -1) {
                return w
            } else {
                return v + '<a href="mailto:' + u + '" onclick="return linkRedirecter(this)">' + u + "</a>"
            }
        };
        h = h.replace(Formatter.re_email, a);
        h = h.replace(/\n/g, "<br />");
        return h
    }
};
Formatter.init();
var Labels = {
    re_labels: /(^|\s+)@([^\s,]+)/g,
    colors: ["#019412", "#a39d01", "#e73d02", "#e702a4", "#9902e7", "#1d02e7", "#0082c5", "#555555"],
    init: function () {
        if (window.IsPremium) {
            this.colors = this.colors.concat(["#008299", "#03b3b2", "#ac193d", "#82ba00", "#111111"])
        }
    },
    onLabel: function (a) {
        addClass(a, "label_on")
    },
    offLabel: function (a) {
        removeClass(a, "label_on")
    },
    getLabels: function (a) {
        var b = [];
        a = a.replace(Labels.re_labels, function (g, d, c) {
            c = c.toLowerCase();
            var f = LabelsModel.get(c);
            if (f) {
                b.push(f.id)
            } else {
                b.push(c)
            }
            return ""
        });
        return [a, b]
    },
    queryLabel: function (a) {
        Agenda.query("@" + a.innerHTML)
    },
    format: function (f, d) {
        if (!d.labels) {
            return f
        }
        var a = {};
        var g = [];
        var b = function (h) {
            if (!a[h.id]) {
                g.push(h);
                a[h.id] = true
            }
        };
        map(d.labels, function (i) {
            var h = LabelsModel.getById(i);
            if (h) {
                b(h);
                f = f.replace(new RegExp("(^|s)@" + h), "$1")
            }
        });
        var c = Labels.getLabels(f)[1];
        map(c, function (h) {
            h = LabelsModel.getById(h);
            if (h) {
                b(h);
                f = f.replace(new RegExp("(^|s)@" + h), "$1")
            }
        });
        return Labels._format(f, g)
    },
    _format: function (c, d) {
        if (!d || d.length == 0) {
            return c
        }
        var a = [];
        var b = 0;
        map(d, function (h, j) {
            if (h) {
                var f = 'style="color: ' + (Labels.colors[h.color] || "#555555") + '"';
                var g = 'onmouseover="Labels.onLabel(this)" onmouseout="Labels.offLabel(this)"';
                a.push('<div class="label" onclick="Labels.queryLabel(this)" ' + f + " " + g + ">" + h.name + "</div>");
                b++;
                c = c.replace(new RegExp("(^|s)@" + h, "ig"), "")
            }
            var k = d[j + 1];
            if (k) {
                a.push('<div class="label label_sep">,</div>')
            }
        });
        if (b > 0) {
            a.push('<div class="label label_sep"> </div>')
        }
        var d = a.join("");
        return c + '<div class="labels_holder">' + d + "</div>"
    },
    formatByContent: function (c) {
        var b = Labels.getLabels(c);
        c = b[0];
        var d = b[1];
        if (d.length == 0) {
            return c
        } else {
            var a = [];
            map(d, function (f) {
                var g;
                if (isNumber(f)) {
                    g = LabelsModel.getById(f)
                } else {
                    g = {
                        name: f,
                        color: 0
                    }
                } if (g) {
                    a.push(g)
                }
            });
            return Labels._format(c, a)
        }
    },
    jsonFormat: function (a) {
        a = a.replace(Labels.re_labels, function (d, c, b) {
            var f = function (g) {
                return "\\" + g
            };
            b = b.replace(/\*|\+/g, f);
            return d.replace(new RegExp(c + "@" + b, "g"), "")
        });
        return strip(a)
    },
    textFormat: function (c, d) {
        var b = {};
        var a = [];
        if (d) {
            map(d, function (i) {
                var g = LabelsModel.getById(i);
                if (g && !b[g.id]) {
                    var f = "@" + g.name;
                    var h = new RegExp("(^|s)@" + AmiComplete.escapeReqExpSepcails(g.name), "ig");
                    if (c.match(h) == null) {
                        a.push(f);
                        b[g.id] = true
                    }
                }
            })
        }
        a = a.join(" ");
        if (a.length > 0) {
            a += " "
        }
        return a + strip(c)
    }
};
var GTImezoneChecker, TimezoneChecker, __bind = function (a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    };
GTImezoneChecker = (function () {
    function a() {
        this.showSettings = __bind(this.showSettings, this);
        this.neverAsk = __bind(this.neverAsk, this);
        this.hideTimezoneHint = __bind(this.hideTimezoneHint, this);
        this.changeTimezoneToCurrent = __bind(this.changeTimezoneToCurrent, this);
        this.createHintLink = __bind(this.createHintLink, this);
        this.showTimezoneHintNormal = __bind(this.showTimezoneHintNormal, this);
        this.showTimezoneHint = __bind(this.showTimezoneHint, this);
        this.guessTimezone = __bind(this.guessTimezone, this);
        this.checkTimezone = __bind(this.checkTimezone, this);
        this.setValidTimezone = __bind(this.setValidTimezone, this);
        this.getValidTimezone = __bind(this.getValidTimezone, this);
        this.mini = window.IS_MINI
    }
    a.prototype.getValidTimezone = function () {
        return $storage("valid_timezone").get()
    };
    a.prototype.setValidTimezone = function (b) {
        return $storage("valid_timezone").set(b)
    };
    a.prototype.checkTimezone = function () {
        var b, d, c;
        if (!window.User || (window.User.tz_offset == null)) {
            return
        }
        if (this.getValidTimezone() === window.User.timezone) {
            return
        }
        d = window.User.tz_offset;
        c = d[1] * 60 + d[2];
        b = -new Date().getTimezoneOffset();
        if (c !== b) {
            return this.guessTimezone(b)
        }
    };
    a.prototype.guessTimezone = function (c) {
        var b;
        b = loadJSON("/API/guessTimezone");
        b.addCallback(this.showTimezoneHint);
        return b.sendReq({
            mm_offset: c
        })
    };
    a.prototype.showTimezoneHint = function (b) {
        return this.showTimezoneHintNormal(b)
    };
    a.prototype.showTimezoneHintNormal = function (c) {
        var b;
        b = DIV({
            c: "timezone_alert"
        });
        if (c !== "UNKNOWN_TIMEZONE") {
            this.current_timezone = c;
            ACN(b, format(_("Change timezone to %s?"), c), BR(), this.createHintLink(_("Yes, update my settings"), this.changeTimezoneToCurrent, "amibutton amibutton_red amibutton_big timezone_button"), BR(), this.createHintLink(_("Don't update settings"), this.hideTimezoneHint, "timezone_link timezone_link_block"), this.createHintLink(_("View my settings"), this.showSettings, "timezone_link timezone_link_block"))
        } else {
            ACN(b, DIV({
                c: "timezone_alert_message"
            }, _("Your system timezone doesn't match your Todoist settings. Fix it now?")), this.createHintLink(_("Yes, show my settings"), this.showSettings, "amibutton amibutton_red amibutton_big timezone_button"), BR(), this.createHintLink(_("Don't update settings"), this.hideTimezoneHint, "timezone_link timezone_link_block"))
        }
        return GB_showHTML(_("Time zone settings"), DIV(b), 200, 340)
    };
    a.prototype.createHintLink = function (f, b, g) {
        var d;
        if (g == null) {
            g = "timezone_link"
        }
        d = A({
            c: g,
            href: "#"
        }, f);
        AEV(d, "click", b);
        return d
    };
    a.prototype.changeTimezoneToCurrent = function () {
        var b;
        this.hideTimezoneHint();
        b = getRequest("/Users/setTimezone");
        b.addCallback(function () {
            return window.location.reload()
        });
        b.sendReq({
            value: this.current_timezone
        });
        return false
    };
    a.prototype.hideTimezoneHint = function () {
        if (this.mini) {
            GB_hideIfNeeded()
        } else {
            Notifier.hide()
        }
        return false
    };
    a.prototype.neverAsk = function () {
        this.setValidTimezone(window.User.timezone);
        this.hideTimezoneHint();
        return false
    };
    a.prototype.showSettings = function () {
        this.hideTimezoneHint();
        WindowOpener.showPrefs("general");
        return false
    };
    return a
})();
TimezoneChecker = new GTImezoneChecker();