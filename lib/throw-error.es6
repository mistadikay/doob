export default function(msg, at) {
    throw new Error(`doob, ${at || 'unknown'} component: ${msg}`);
}
