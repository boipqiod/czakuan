'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import TextEditor from '@/client/components/post/create/TextEditor';
import {useAuthStore} from '@/client/store/AuthStore';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import {updatePost} from '@/server/actions/post.actions';
import {PostDetailType} from '@/types/post';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';

type PostModifyProps = {
  post: PostDetailType;
};

export const PostModify = ({post}: PostModifyProps) => {
  const router = useRouter();

  const {isLogin, user} = useAuthStore();
  const [title, setTitle] = useState<string>(post.title);
  const [content, setContent] = useState<string>(post.content);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!isLogin || !user || user.id !== post.author.id) {
      alert('권한이 없습니다.');
      window.history.back();
    }
  }, []);

  const uploadImage = async (imageUrl: string) => {
    setImages([...images, imageUrl]);
  };

  const Editor = useMemo(
    () => (
      <TextEditor
        defaultValue={post.content}
        onChange={setContent}
        onAddImage={uploadImage}
      />
    ),
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

    actionWrapper(() => updatePost(post.id, title, content, images), {
      success: res => {
        const {id} = res.data;
        alert('게시글이 수정되었습니다.');
        router.push(`/post/${id}`);
      },
    });
  };

  return (
    <Flex width={'100%'} gap={10}>
      <h2>게시글 수정</h2>
      <Flex gap={10}>
        <HFlex>
          <Flex width={'100%'}>
            <Text fontSize={'1.2rem'}>제목</Text>
            <Input
              defaultValue={post.title}
              onChange={setTitle}
              placeholder={'제목'}
            />
          </Flex>
        </HFlex>
      </Flex>
      <Text fontSize={'1.2rem'}>본문</Text>
      {Editor}
      <Button padding={'0.5rem'} onClick={handleSubmit}>
        수정하기
      </Button>
    </Flex>
  );
};
