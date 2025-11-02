import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';

interface HeadersViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  monitor?: IHttpMonitor | null;
}

export const HeadersViewModal: React.FC<HeadersViewModalProps> = ({ isOpen, toggle, monitor }) => {
  const formatJSON = (value: any) => {
    if (!value) return 'No headers content';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return value;
  };

  const headers = monitor?.headers;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Request Headers: {monitor?.name}</ModalHeader>
      <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="headers-view-content">
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
            {formatJSON(headers)}
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

export default HeadersViewModal;
