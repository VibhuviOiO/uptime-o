import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';

interface BodyViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  monitor?: IHttpMonitor | null;
}

export const BodyViewModal: React.FC<BodyViewModalProps> = ({ isOpen, toggle, monitor }) => {
  const formatJSON = (value: any) => {
    if (!value) return 'No body content';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return value;
  };

  const body = monitor?.body;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Request Body: {monitor?.name}</ModalHeader>
      <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="body-view-content">
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '500px',
              fontSize: '13px',
              lineHeight: '1.5',
              border: '1px solid #ddd',
            }}
          >
            {formatJSON(body)}
          </pre>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          <FontAwesomeIcon icon={faTimes} />
          &nbsp; Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BodyViewModal;
