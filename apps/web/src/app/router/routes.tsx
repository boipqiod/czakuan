import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/widgets/layouts";
import { HomePage } from "@/pages/home";
import { LoginPage, KakaoCallbackPage } from "@/pages/auth";
import { BoardListPage, PostListPage, PostDetailPage, PostWritePage } from "@/pages/post";
import { MyPage } from "@/pages/my";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/auth/kakao/callback",
        element: <KakaoCallbackPage />,
      },
      {
        path: "/boards",
        element: <BoardListPage />,
      },
      {
        path: "/boards/:categoryId",
        element: <PostListPage />,
      },
      {
        path: "/posts/:postId",
        element: <PostDetailPage />,
      },
      {
        path: "/write",
        element: <PostWritePage />,
      },
      {
        path: "/popular",
        element: <PostListPage />,
      },
      {
        path: "/my",
        element: <MyPage />,
      },
    ],
  },
]);
