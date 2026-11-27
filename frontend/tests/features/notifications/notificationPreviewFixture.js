export function criarSdk(granted = true) {
    return {
        AndroidImportance: { NONE: 0, HIGH: 4 },
        AndroidNotificationVisibility: { PRIVATE: 0 },
        IosAuthorizationStatus: { PROVISIONAL: 3 },
        getPermissionsAsync: jest.fn().mockResolvedValue({ granted, canAskAgain: false }),
        requestPermissionsAsync: jest.fn(),
        getNotificationChannelAsync: jest.fn().mockResolvedValue({ importance: 4 }),
        setNotificationChannelAsync: jest.fn(),
        setNotificationHandler: jest.fn(),
        scheduleNotificationAsync: jest.fn()
    };
}

export const aviso = {
    codigo: 'ciclo.diario.lembreteDiarioAtivo',
    rotulo: 'Lembrete diário',
    canal: 'ciclo'
};
