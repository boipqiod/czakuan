'use client';
import {useAddQeryPrams} from '@/client/hooks/useNavigate';
import {Button} from '@/client/ui/widgets/Button';
import {HFlex} from '@/client/ui/widgets/Flex';

type PaginationProps = {
  totalPage: number;
  currentPage: number;
};
export const Pagination = ({totalPage, currentPage}: PaginationProps) => {
  // const router = useRouter();
  const addQuery = useAddQeryPrams();

  const onClickPage = (page: number) => {
    addQuery({page: page.toString()});
    // const query = getSearchParam(window.location.search);
    // query.page = page.toString();
    // const search = new URLSearchParams(query).toString();
    // router.push('?' + search);
  };

  return (
    <HFlex gap={10} width={'100%'} justifyContent={'center'}>
      <Button
        onClick={() => onClickPage(currentPage - 1)}
        disabled={currentPage === 1}>
        {'<'}
      </Button>
      {Array.from({length: totalPage}, (_, i) => i + 1).map(page => (
        <Button
          key={page}
          onClick={() => onClickPage(page)}
          fontWeight={currentPage === page ? 'bold' : 'normal'}>
          {page}
        </Button>
      ))}
      <Button
        onClick={() => onClickPage(currentPage + 1)}
        disabled={currentPage === totalPage}>
        {'>'}
      </Button>
    </HFlex>
  );
};
