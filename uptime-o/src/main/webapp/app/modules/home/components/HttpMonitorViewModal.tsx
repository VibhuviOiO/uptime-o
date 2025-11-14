import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';

interface HttpMonitorViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  monitor?: IHttpMonitor | null;
}

export const HttpMonitorViewModal: React.FC<HttpMonitorViewModalProps> = ({ isOpen, toggle, monitor }) => {
  const parseJSON = (value: any) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const formatJSON = (value: any) => {
    if (!value) return 'None';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return value;
  };

  const headers = parseJSON(monitor?.headers);
  const body = parseJSON(monitor?.body);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Monitor Details: {monitor?.name}</ModalHeader>
      <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="view-modal-content">
          {/* Basic Info */}
          <div className="detail-section mb-4">
            <h5 className="section-title border-bottom pb-2 mb-3">Basic Information</h5>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>Name:</strong>
              </div>
              <div className="col-sm-8">
                <span>{monitor?.name || '-'}</span>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>URL:</strong>
              </div>
              <div className="col-sm-8">
                <a href={monitor?.url} target="_blank" rel="noopener noreferrer">
                  {monitor?.url || '-'}
                </a>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>Method:</strong>
              </div>
              <div className="col-sm-8">
                <span className="badge bg-info">{monitor?.method || 'GET'}</span>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>Type:</strong>
              </div>
              <div className="col-sm-8">
                <span>{monitor?.type || '-'}</span>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>Interval:</strong>
              </div>
              <div className="col-sm-8">
                <span>{monitor?.intervalSeconds}s</span>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>Timeout:</strong>
              </div>
              <div className="col-sm-8">
                <span>{monitor?.timeoutSeconds}s</span>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <strong>Retry:</strong>
              </div>
              <div className="col-sm-8">
                <span>
                  {monitor?.retryCount} attempts, {monitor?.retryDelaySeconds}s delay
                </span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4">
                <strong>ID:</strong>
              </div>
              <div className="col-sm-8">
                <code>{monitor?.id || '-'}</code>
              </div>
            </div>
          </div>

          {/* Headers */}
          <div className="detail-section mb-4">
            <h5 className="section-title border-bottom pb-2 mb-3">Headers</h5>
            {headers ? (
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                }}
              >
                {formatJSON(headers)}
              </pre>
            ) : (
              <span className="text-muted">No headers</span>
            )}
          </div>

          {/* Body */}
          <div className="detail-section">
            <h5 className="section-title border-bottom pb-2 mb-3">Request Body</h5>
            {body ? (
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                }}
              >
                {formatJSON(body)}
              </pre>
            ) : (
              <span className="text-muted">No body</span>
            )}
          </div>
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

export default HttpMonitorViewModal;
