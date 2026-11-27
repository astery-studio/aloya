function analisarLinkExterno(url) {
    if (typeof url !== 'string' || url.trim().length === 0) return null;

    let link;

    try {
        link = new URL(url);
    } catch {
        return null;
    }

    const token = link.searchParams.get('token');

    if (!token) return null;

    const caminho = `${link.hostname}${link.pathname}`.replace(/\/$/u, '');
    const caminhoWeb = link.pathname.replace(/\/$/u, '');

    if (caminho === 'reset-password' || caminhoWeb === '/reset-password') {
        return Object.freeze({ tipo: 'recuperacao_senha', token });
    }

    if (caminho === 'support-network/invitation' || caminhoWeb === '/support-network/invitation') {
        return Object.freeze({ tipo: 'convite_rede_apoio', token });
    }

    return null;
}

export { analisarLinkExterno };
