import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faGlobe, faEye, faPencil, faTrash, faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './region.reducer';
import '../entity.scss';

export const Region = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const regionList = useAppSelector(state => state.region.entities);
  const loading = useAppSelector(state => state.region.loading);
  const totalItems = useAppSelector(state => state.region.totalItems);

  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  return (
    <div className="regions-page">
      <div className="regions-header">
        <div className="header-content">
          <h1 id="region-heading" data-cy="RegionHeading">
            <FontAwesomeIcon icon={faGlobe} className="me-2" />
            Regions
          </h1>
        </div>
        <div className="header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} outline>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
          <Link to="/region/new" className="btn btn-primary" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Region
          </Link>
        </div>
      </div>

      {regionList && regionList.length > 0 ? (
        <>
          <div className="smart-table-wrapper">
            <table className="smart-table" data-cy="entityTable">
              <thead>
                <tr>
                  <th className="sortable" onClick={sort('id')}>
                    <span className="th-content">
                      ID
                      <FontAwesomeIcon icon={getSortIconByFieldName('id')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('regionCode')}>
                    <span className="th-content">
                      Code
                      <FontAwesomeIcon icon={getSortIconByFieldName('regionCode')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('name')}>
                    <span className="th-content">
                      Name
                      <FontAwesomeIcon icon={getSortIconByFieldName('name')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('groupName')}>
                    <span className="th-content">
                      Group
                      <FontAwesomeIcon icon={getSortIconByFieldName('groupName')} className="ms-1" />
                    </span>
                  </th>
                  <th className="actions-column">
                    <span className="th-content">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {regionList.map((region, i) => (
                  <tr key={`entity-${i}`} className="table-row">
                    <td className="id-cell">
                      <span className="badge bg-secondary">{region.id}</span>
                    </td>
                    <td className="code-cell">
                      <code className="code-badge">{region.regionCode}</code>
                    </td>
                    <td className="name-cell">
                      <strong>{region.name}</strong>
                    </td>
                    <td className="group-cell">{region.groupName ? region.groupName : <span className="text-muted">N/A</span>}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <Button
                          tag={Link}
                          to={`/region/${region.id}`}
                          color="info"
                          size="sm"
                          outline
                          data-cy="entityDetailsButton"
                          className="action-btn btn-view"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                          tag={Link}
                          to={`/region/${region.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                          color="primary"
                          size="sm"
                          outline
                          data-cy="entityEditButton"
                          className="action-btn btn-edit"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </Button>
                        <Button
                          onClick={() =>
                            (window.location.href = `/region/${region.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`)
                          }
                          color="danger"
                          size="sm"
                          outline
                          data-cy="entityDeleteButton"
                          className="action-btn btn-delete"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalItems ? (
            <div className="table-pagination">
              <div className="pagination-info">
                <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
              </div>
              <div className="pagination-controls">
                <JhiPagination
                  activePage={paginationState.activePage}
                  onSelect={handlePagination}
                  maxButtons={5}
                  itemsPerPage={paginationState.itemsPerPage}
                  totalItems={totalItems}
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </>
      ) : (
        !loading && <div className="alert alert-warning">No Regions found</div>
      )}
    </div>
  );
};

export default Region;
