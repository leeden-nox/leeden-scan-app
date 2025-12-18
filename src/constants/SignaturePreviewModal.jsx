import { Modal, Image } from "antd";

const SignaturePreviewModal = ({ visible, setVisible, base64String, name }) => {
  const imageUrl = base64String ? `data:image/jpeg;base64,${base64String}` : null;

  return (
    <Modal
      title={`Received By - ${name}`}
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
