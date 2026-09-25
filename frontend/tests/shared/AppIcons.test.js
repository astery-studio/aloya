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

jest.mock('phosphor-react-native/src/icons/CaretDown', () => ({
    CaretDownIcon: 'CaretDownIcon'
}))

jest.mock('phosphor-react-native/src/icons/CaretUp', () => ({
    CaretUpIcon: 'CaretUpIcon'
}))

jest.mock('phosphor-react-native/src/icons/Drop', () => ({
    DropIcon: 'DropIcon'
}))

jest.mock('phosphor-react-native/src/icons/FirstAidKit', () => ({
    FirstAidKitIcon: 'FirstAidKitIcon'
}))

jest.mock('phosphor-react-native/src/icons/Heart', () => ({
    HeartIcon: 'HeartIcon'
}))

jest.mock('phosphor-react-native/src/icons/House', () => ({
    HouseIcon: 'HouseIcon'
}))

jest.mock('phosphor-react-native/src/icons/Info', () => ({
    InfoIcon: 'InfoIcon'
}))

jest.mock('phosphor-react-native/src/icons/Lightning', () => ({
    LightningIcon: 'LightningIcon'
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

jest.mock('phosphor-react-native/src/icons/PersonArmsSpread', () => ({
    PersonArmsSpreadIcon: 'PersonArmsSpreadIcon'
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

jest.mock('phosphor-react-native/src/icons/Users', () => ({
    UsersIcon: 'UsersIcon'
}))

jest.mock('phosphor-react-native/src/icons/WarningCircle', () => ({
    WarningCircleIcon: 'WarningCircleIcon'
}))

jest.mock('phosphor-react-native/src/icons/X', () => ({
    XIcon: 'XIcon'
}))

import * as AppIcons from '../../components/icons/AppIcons'

test('exporta todos os ícones centralizados', () => {
    expect(AppIcons).toMatchObject({
        ArrowLeftIcon: 'ArrowLeftIcon',
        ArrowsClockwiseIcon: 'ArrowsClockwiseIcon',
        BellIcon: 'BellIcon',
        CaretDownIcon: 'CaretDownIcon',
        CaretUpIcon: 'CaretUpIcon',
        DropIcon: 'DropIcon',
        FirstAidKitIcon: 'FirstAidKitIcon',
        HeartIcon: 'HeartIcon',
        HouseIcon: 'HouseIcon',
        InfoIcon: 'InfoIcon',
        LightningIcon: 'LightningIcon',
        LockKeyIcon: 'LockKeyIcon',
        MoonIcon: 'MoonIcon',
        NotePencilIcon: 'NotePencilIcon',
        PersonArmsSpreadIcon: 'PersonArmsSpreadIcon',
        ShieldCheckIcon: 'ShieldCheckIcon',
        TrashIcon: 'TrashIcon',
        UserIcon: 'UserIcon',
        UsersIcon: 'UsersIcon',
        WarningCircleIcon: 'WarningCircleIcon',
        XIcon: 'XIcon'
    })
})