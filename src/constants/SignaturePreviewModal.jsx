import { Modal, Image } from "antd";

const SignaturePreviewModal = ({ visible, setVisible, base64String }) => {
  const imageUrl = base64String ? `data:image/jpeg;base64,${base64String}` : null;

  return (
    <Modal
      title="Signature Preview"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      centered
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="Signature" width={300} />
      ) : (
        <p>No signature available.</p>
      )}
    </Modal>
  );
};

export default SignaturePreviewModal;
