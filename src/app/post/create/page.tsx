'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import TextEditor from '@/client/components/post/creat/TextEditor';
import {useAuthStore} from '@/client/store/AuthStore';
import {
  CategoryGroup,
  CategoryItem,
  useCategoryStore,
} from '@/client/store/CategoryStore';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import {createPost} from '@/server/actions/post.actions';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';

const CreatePostPage = () => {
  const {user} = useAuthStore();
  const {categories, getCategory, getSubCategory} = useCategoryStore();
  const router = useRouter();

  const [categoryGroup, setCategoryGroup] = useState<CategoryGroup>(
    categories[0],
  );

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<CategoryItem>(
    categoryGroup?.categories[0] ?? {id: 0, name: '', subCategories: []},
  );
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>(
    category.subCategories[0]?.id,
  );
  const [images, setImages] = useState<string[]>([]);
  const [isNotice, setIsNotice] = useState<boolean>(false);

  const uploadImage = async (imageUrl: string) => {
    setImages([...images, imageUrl]);
  };

  useEffect(() => {
    if (category.subCategories.length > 0) {
      setSubCategoryId(category.subCategories[0].id);
    } else {
      setSubCategoryId(undefined);
    }
  }, [category]);

  const Editor = useMemo(
    () => <TextEditor onChange={setContent} onAddImage={uploadImage} />,
    [],
  );

  const handleSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!title || title.trim() === '') {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!content || content.trim() === '') {
      alert('본문을 입력해주세요.');
      return;
    }

    if (!category) {
      alert('게시판을 선택해주세요.');
      return;
    }

    actionWrapper(
      () =>
        createPost(
          title,
          content,
          images,
          category.id,
          subCategoryId,
          isNotice,
        ),
      {
        success: res => {
          const {id} = res.data;
          alert('게시글이 등록되었습니다.');
          router.push(`/post/${id}`);
        },
      },
    );
  };

  return (
    <Flex width={'100%'} gap={10}>
      <h2>게시글 작성</h2>
      <Flex gap={10}>
        <HFlex>
          <Flex width={'100%'}>
            <Text fontSize={'1.2rem'}>제목</Text>
            <Input onChange={setTitle} placeholder={'제목'} />
          </Flex>
          {user && user.role.includes('ADMIN') && (
            <Flex width={'4rem'} alignItems={'center'}>
              <Text>공지</Text>
              <input
                width={'10px'}
                type={'checkbox'}
                checked={isNotice}
                onChange={e => setIsNotice(e.target.checked)}
              />
            </Flex>
          )}
        </HFlex>

        <Flex gap={5}>
          <Text fontSize={'1.2rem'}>게시판</Text>
          <select
            style={{
              borderRadius: 4,
              padding: '0.5rem',
            }}
            value={categoryGroup.id}
            onChange={e =>
              setCategoryGroup(
                categories.find(
                  category => category.id === Number(e.target.value),
                ) ?? categories[0],
              )
            }>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            style={{
              borderRadius: 4,
              padding: '0.5rem',
            }}
            value={category.id}
            onChange={e =>
              setCategory(
                categoryGroup.categories.find(
                  category => category.id === Number(e.target.value),
                ) ?? categoryGroup.categories[0],
              )
            }>
            {categoryGroup?.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {category.subCategories.length > 0 && (
            <select
              style={{
                borderRadius: 4,
                padding: '0.2rem',
              }}
              value={subCategoryId}
              onChange={e => setSubCategoryId(Number(e.target.value))}>
              {category.subCategories.map(subCategory => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          )}
        </Flex>
      </Flex>
      <Text fontSize={'1.2rem'}>본문</Text>
      {Editor}
      <Button padding={'0.5rem'} onClick={handleSubmit}>
        작성하기
      </Button>
    </Flex>
  );
};

export default CreatePostPage;
