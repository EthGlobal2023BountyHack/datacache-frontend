import { Layout } from '@/components';
import SignInWithWorldcoin from '@/components/us-as-a-issuer/worldcoin/SignInWithWorldcoin';

export default function Profile() {
  return (
    <Layout isHeaderTransparent={true}>
      <SignInWithWorldcoin />
    </Layout>
  );
}