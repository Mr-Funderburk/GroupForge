let state = {
    classes: [],
    activeClassId: null
};

let selectedGender = "O";
let buldDefaultGender = "O";
let newClassColor = "#6c8fff";
let undoStack = null;
let undoBannerTimer = null;
let dragState = { studentId: null, fromGroup: null };
let reassignStudentId = null;
let currentSortMethod = "random";

const CLASS_COLORS = [
  "#6c8fff", "#ff6b8a", "#42e5c4", "#f5c842", "#b8a9ff",
  "#ff9f43", "#0be881", "#ff4757", "#2ed573", "#ffa502"
];

//#region Persistance

function saveState() {
    try { 
        localStorage.setItem("groupforge_state", JSON.stringify(state)); 
    } catch(e) {}
}

function loadState() {
    try {
        const s = localStorage.getItem("groupforge_state");
        if (s) state = JSON.parse(s);
    } catch(e) {}
}

//#endregion
//#region Init

function init() {
    loadState();
    renderColorPicker();
    renderClassList();

    if (state.classes.length > 0) {
        const last = state.activeClassId || state.classes[0].id;
        const cls = state.classes.find(c => c.id === last);
        if (cls) {
            selectClass(cls.id);
            toast("📂 Previous session restored");
        } else {
            selectClass(state.classes[0].id);
        }
    } else {
        showNoClass();
    }
}

//#endregion
//#region Class Management



//#endregion