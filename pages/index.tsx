import { Layout } from '@/components';
import { FaUserCircle } from 'react-icons/fa'

const Lander = ({ user }) => {
  return (
    <Layout isHeaderTransparent={true}>
      <section className="px-20 flex">
        <div className="bg-red-500 p-40">
          <div>
            <FaUserCircle size={100}/>
          </div>
        </div>
        <div className="bg-blue-500 flex-grow">1</div>
      </section>
    </Layout>
  );
};

export default Lander;
