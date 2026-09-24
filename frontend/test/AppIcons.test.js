//Confirma que todos os ícones centralizados estão disponíveis para os componentes.
jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({
    ArrowLeftIcon: 'ArrowLeftIcon'
}))

jest.mock('phosphor-react-native/src/icons/ArrowsClockwise', () => ({
    ArrowsClockwiseIcon: 'ArrowsClockwiseIcon'
}))

jest.mock('phosphor-react-native/src/icons/Bell', () => ({
    BellIcon: 'BellIcon'
}))

jest.mock('phosphor-react-native/src/icons/House', () => ({
    HouseIcon: 'HouseIcon'
}))

jest.mock('phosphor-react-native/src/icons/Info', () => ({
    InfoIcon: 'InfoIcon'
}))

jest.mock('phosphor-react-native/src/icons/LockKey', () => ({
    LockKeyIcon: 'LockKeyIcon'
}))

jest.mock('phosphor-react-native/src/icons/Moon', () => ({
    MoonIcon: 'MoonIcon'
}))

jest.mock('phosphor-react-native/src/icons/NotePencil', () => ({
    NotePencilIcon: 'NotePencilIcon'
}))

jest.mock('phosphor-react-native/src/icons/ShieldCheck', () => ({
    ShieldCheckIcon: 'ShieldCheckIcon'
}))

jest.mock('phosphor-react-native/src/icons/Trash', () => ({
    TrashIcon: 'TrashIcon'
}))

jest.mock('phosphor-react-native/src/icons/User', () => ({
    UserIcon: 'UserIcon'
}))

jest.mock('phosphor-react-native/src/icons/WarningCircle', () => ({
    WarningCircleIcon: 'WarningCircleIcon'
}))

jest.mock('phosphor-react-native/src/icons/X', () => ({
    XIcon: 'XIcon'
}))

import {
    ArrowLeftIcon,
    ArrowsClockwiseIcon,
    BellIcon,
    HouseIcon,
    InfoIcon,
    LockKeyIcon,
    MoonIcon,
    NotePencilIcon,
    ShieldCheckIcon,
    TrashIcon,
    UserIcon,
    WarningCircleIcon,
    XIcon
} from '../components/icons/AppIcons'

test('exporta todos os ícones centralizados', () => {
    expect({
        ArrowLeftIcon,
        ArrowsClockwiseIcon,
        BellIcon,
        HouseIcon,
        InfoIcon,
        LockKeyIcon,
        MoonIcon,
        NotePencilIcon,
        ShieldCheckIcon,
        TrashIcon,
        UserIcon,
        WarningCircleIcon,
        XIcon
    }).toEqual({
        ArrowLeftIcon: 'ArrowLeftIcon',
        ArrowsClockwiseIcon: 'ArrowsClockwiseIcon',
        BellIcon: 'BellIcon',
        HouseIcon: 'HouseIcon',
        InfoIcon: 'InfoIcon',
        LockKeyIcon: 'LockKeyIcon',
        MoonIcon: 'MoonIcon',
        NotePencilIcon: 'NotePencilIcon',
        ShieldCheckIcon: 'ShieldCheckIcon',
        TrashIcon: 'TrashIcon',
        UserIcon: 'UserIcon',
        WarningCircleIcon: 'WarningCircleIcon',
        XIcon: 'XIcon'
    })
})