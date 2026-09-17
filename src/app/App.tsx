import { useEffect, useState } from "react";
import {
  AuthProvider,
  useAuth,
  type Profile,
  type Role,
} from "../hooks/useAuth";
import {
  usePosts,
  fetchNotifications,
  markAllNotificationsRead,
  updatePostStatus as updatePostStatusDb,
  type UINotification,
  type UIPost,
  type PostStatus,
} from "../hooks/useOccurrences";
import { Spinner } from "./components/common";
import { WelcomePage } from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { CitizenPage } from "./pages/CitizenPage";
import { CityHallPage } from "./pages/CityHallPage";
function AuthenticatedApp({ profile }: { profile: Profile }) {
  const { signOut } = useAuth();
  const {
    posts,
    loading: postsLoading,
    refetch,
    setPosts,
  } = usePosts(profile.id);
  const [notifs, setNotifs] = useState<UINotification[]>([]);
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    fetchNotifications(profile.id).then(setNotifs);
  }, [profile.id]);
  const onToggleDark = () => setDark((d) => !d);
  const onLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
    }
  };
  const onMarkAllRead = async () => {
    await markAllNotificationsRead(profile.id);
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  };
  const handleUpdateStatus = async (
    post: UIPost,
    status: PostStatus,
    obs: string,
  ) => {
    await updatePostStatusDb(post.id, status, obs, profile.id, post.userId);
    await refetch();
  };
  if (postsLoading && posts.length === 0)
    return <Spinner label="Carregando ocorrências…" />;
  if (profile.role === "prefeitura")
    return (
      <CityHallPage
        posts={posts}
        profile={profile}
        dark={dark}
        onToggleDark={onToggleDark}
        onLogout={onLogout}
        onUpdateStatus={handleUpdateStatus}
      />
    );
  return (
    <CitizenPage
      posts={posts}
      setPosts={setPosts}
      profile={profile}
      notifs={notifs}
      onMarkAllRead={onMarkAllRead}
      dark={dark}
      onToggleDark={onToggleDark}
      onLogout={onLogout}
      refetchPosts={refetch}
    />
  );
}
function UnauthenticatedApp() {
  const [screen, setScreen] = useState<"welcome" | "login" | "signup">(
    "welcome",
  );
  const [intentRole, setIntentRole] = useState<Role>("cidadao");
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const onToggleDark = () => setDark((d) => !d);
  const shell = (children: React.ReactNode) => (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {children}
    </div>
  );
  if (screen === "login")
    return shell(
      <LoginPage
        intentRole={intentRole}
        onBack={() => setScreen("welcome")}
        onSignUp={() => setScreen("signup")}
        dark={dark}
        onToggleDark={onToggleDark}
      />,
    );
  if (screen === "signup")
    return shell(
      <SignUpPage
        onBack={() => setScreen("login")}
        dark={dark}
        onToggleDark={onToggleDark}
      />,
    );
  return shell(
    <WelcomePage
      onChoose={(role) => {
        setIntentRole(role);
        setScreen("login");
      }}
      dark={dark}
      onToggleDark={onToggleDark}
    />,
  );
}
function Root() {
  const { session, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  return session && profile ? (
    <AuthenticatedApp profile={profile} />
  ) : (
    <UnauthenticatedApp />
  );
}
export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
