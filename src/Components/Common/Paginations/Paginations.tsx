import { useEffect, useState } from "react";
import "./CustomPagination.scss";
import { PaginationProps } from "../../../Utils/Interfaces";
const LEFT_PAGE = "LEFT";
const RIGHT_PAGE = "RIGHT";
const range = (from: number, to: number, step: any = 1) => {
  let i = from;
  const range: any = [];

  while (i <= to) {
    range.push(i);
    i += step;
  }

  return range;
};

const Pagination = (props: PaginationProps) => {
  let pageNeighbours = props?.pageNeighbours || 2
  const {
    totalRecords,
    pageLimit,
    onPageChanged,
    currentPage,
    totalPage
  } = props;
  const [totalPages, setTotalPages] = useState(totalPage);
  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / pageLimit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalRecords]);

  const fetchPageNumbers = () => {
    const totalNumbers = (pageNeighbours * 2) + 3;
    const totalBlocks = totalNumbers + 1;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

      let pages: any = range(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = totalPages - currentPage >= 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      switch (true) {
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = range(startPage - spillOffset, startPage - 1);

          pages = [LEFT_PAGE, ...extraPages, ...pages];
          break;
        }
        case hasLeftSpill && hasRightSpill:
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
          break;
        }
      }
      return [1, ...pages, totalPages];
    }
    return range(1, totalPages);
  };

  const pages = fetchPageNumbers() || [];

  return (
    <nav aria-label="Countries Pagination" className="PaginationCustom">
      <ul className="pagination">
        {
          (pages.includes(LEFT_PAGE)) ? (

            <li key={'index'} className="page-item" style={{ display: `${currentPage - 1 <= 0 ? 'none' : ''}` }}>
              <a
                href="/"
                className="page-link previewarrow"
                aria-label="Previous"
                onClick={(e) => {
                  onPageChanged(e, (currentPage - 1))
                }}
              >
              </a>
            </li>
          ) : ''
        }
        {pages.map((page:any) => {

          return page === 'RIGHT' ? (
            <>
              {currentPage + 5 > totalPage ? (
                <>
                  <li
                    key={page}
                    className={`page-item${currentPage === totalPage - 1 ? ' active' : ''}`}
                    style={{
                      display: `${currentPage === totalPage - 1 || pages.includes(totalPage - 1) ? 'none' : ''}`,
                    }}
                  >
                    <a className="page-link" href="/" onClick={(e) => onPageChanged(e, totalPage - 1)}>
                      {totalPage - 1}
                    </a>
                  </li>
                </>
              ) : (
                <li key={page} className={`page-item${currentPage === page ? ' active' : ''}`}>
                  <a className="page-link right" href="#section" onClick={(e) => onPageChanged(e, currentPage + 5)}>
                    <span className="dot">...</span>
                    <span aria-hidden="true" className="arrow">
                      &raquo;
                    </span>
                  </a>
                </li>
              )}
            </>
          ) : (
            <li key={page} className={`page-item${currentPage === page ? ' active' : ''}`}>
              {page === 'LEFT' ? (
                <>
                  {currentPage - 5 >= 1 ? (
                    <>
                      <a className="page-link" href="#section" onClick={(e) => onPageChanged(e, currentPage - 5)}>
                        <span className="dot">...</span>
                        <span aria-hidden="true" className="arrow">
                          &laquo;
                        </span>
                      </a>
                    </>
                  ) : (
                    ''
                  )}
                </>
              ) : (
                <a className="page-link" href="/" onClick={(e) => onPageChanged(e, page)}>
                  {page}
                </a>
              )}
            </li>
          )
        })}
        {
          (pages.includes(RIGHT_PAGE)) ?
            (
              <li className="page-item">
                <a
                  className="page-link nextarrow"
                  href="/"
                  aria-label="Next"
                  onClick={(e) => onPageChanged(e, (currentPage + 1))}
                >
                </a>
              </li>
            ) : ''

        }
      </ul>
    </nav>
  );
};

export default Pagination;