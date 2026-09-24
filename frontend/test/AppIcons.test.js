jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({
    ArrowLeftIcon: 'ArrowLeftIcon'
}))

jest.mock('phosphor-react-native/src/icons/LockKey', () => ({
    LockKeyIcon: 'LockKeyIcon'
}))

jest.mock('phosphor-react-native/src/icons/NotePencil', () => ({
    NotePencilIcon: 'NotePencilIcon'
}))

jest.mock('phosphor-react-native/src/icons/Trash', () => ({
    TrashIcon: 'TrashIcon'
}))

jest.mock('phosphor-react-native/src/icons/WarningCircle', () => ({
    WarningCircleIcon: 'WarningCircleIcon'
}))

jest.mock('phosphor-react-native/src/icons/X', () => ({
    XIcon: 'XIcon'
}))

import {
    ArrowLeftIcon,
    LockKeyIcon,
    NotePencilIcon,
    TrashIcon,
    WarningCircleIcon,
    XIcon
} from '../components/icons/AppIcons'

test('exporta todos os ícones centralizados', () => {
    expect({
        ArrowLeftIcon,
        LockKeyIcon,
        NotePencilIcon,
        TrashIcon,
        WarningCircleIcon,
        XIcon
    }).toEqual({
        ArrowLeftIcon: 'ArrowLeftIcon',
        LockKeyIcon: 'LockKeyIcon',
        NotePencilIcon: 'NotePencilIcon',
        TrashIcon: 'TrashIcon',
        WarningCircleIcon: 'WarningCircleIcon',
        XIcon: 'XIcon'
    })
})