import { reactive } from 'vue';
export function useToast() {
    const toast = reactive({
        show: false,
        message: '',
        color: 'success',
    });
    const openToast = (message, color = 'success') => {
        toast.show = false;
        toast.message = message;
        toast.color = color;
        setTimeout(() => {
            toast.show = true;
        }, 10);
    };
    return {
        toast,
        openToast,
    };
}
