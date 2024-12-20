'use client';
import {useQueryParams} from '@/client/hooks/useNavigate';
import {Button, ClearButton} from '@/client/ui/widgets/Button';
import {HFlex} from '@/client/ui/widgets/Flex';
import {MdNavigateBefore, MdNavigateNext} from 'react-icons/md';

type PaginationProps = {
  lastPage: number;
  currentPage: number;
  setPage?: (page: number) => void;
};
export const Pagination = ({
  lastPage,
  currentPage,
  setPage,
}: PaginationProps) => {
  const {addQuery} = useQueryParams();

  const onClickPage = (page: number) => {
    if (setPage) {
      setPage(page);
    } else {
      addQuery({page: page.toString()});
    }
  };

  return (
    <HFlex gap={10} width={'100%'} justifyContent={'center'}>
      <ClearButton
        onClick={() => onClickPage(currentPage - 1)}
        disabled={currentPage === 1}>
        <MdNavigateBefore size={'1.2rem'} />
      </ClearButton>
      {Array.from({length: lastPage}, (_, i) => i + 1).map(page => (
        <Button
          fontSize={'.8rem'}
          key={page}
          onClick={() => onClickPage(page)}
          backgroundColor={currentPage === page ? '#444' : 'transparent'}
          fontWeight={currentPage === page ? 'bold' : 'normal'}>
          {page}
        </Button>
      ))}
      <ClearButton
        onClick={() => onClickPage(currentPage + 1)}
        disabled={currentPage === lastPage}>
        <MdNavigateNext />
      </ClearButton>
    </HFlex>
  );
};
