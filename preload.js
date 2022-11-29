const remote = require('electron')
window.market = {
    getNotifyList() {
        return window.rubick.db.get("workListName")
    }
}