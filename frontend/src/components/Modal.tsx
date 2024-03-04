const Modal = ({
    show,
    handleClose,
    children
}: {
    show: boolean;
    handleClose: () => void;
    children: any;
}) => {
    const modalStyles = "top-0 left-0 bg-white position-fixed w-100 h-100";

    return (
        <div
            className={
                show
                    ? `display-block ${modalStyles}`
                    : `display-none ${modalStyles}`
            }
        >
            <section className="h-auto position-fixed bg-white-500 w-80 top-0.5 left-0.5 transform -translate-x-1/2 -translate-y-1/2">
                {children}
                <button onClick={handleClose}>Close</button>
            </section>
        </div>
    );
};

export default Modal;
