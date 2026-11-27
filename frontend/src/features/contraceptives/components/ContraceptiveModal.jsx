import { Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function ContraceptiveModal({ children, ...props }) {
    return (
        <Modal {...props} statusBarTranslucent navigationBarTranslucent>
            <SafeAreaProvider testID="anticoncepcionais-modal-area-segura">
                {children}
            </SafeAreaProvider>
        </Modal>
    );
}
