/**
 * Created by Truth on 2017/6/15.
 */


// 可以从外界输入端口号
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
