import { Layout, Dialog } from '@/components';
import SignInWithWorldcoin from '@/components/us-as-a-issuer/worldcoin/SignInWithWorldcoin';
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import axios from 'axios';
type tags = {
  name: string;
  origin: string;
};

interface Attributes {
  bigWhaleOfApecoin: boolean;
  xMTPEnabled: boolean;
  eRC6551Supporter: boolean;
  worldcoinVerified: boolean;
}
const DOCK_DID = 'did:polygonid:polygon:mumbai:2qJWpumoQNRu623Rae8RYGiA7txGxmeBrJ1wjXFTt6';
const sampleSchema = {
  url: 'https://schema.dock.io/Datacache-V2-1695518329905.json',
  name: 'Datacache',
  populateFunc(data: Attributes) {
    // NOTE: the attributes returned here MUST match the schema
    return data;
  },
};

export default function Profile() {
  const [{ user }, setUser] = useContext(UserContext);
  let [isOpen, setIsOpen] = useState(true);

  const [worldcoinVerified, setWorldcoinVerified] = useState<boolean>(false);
  const [claimQR, setClaimQR] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  //query api for their elgibility proven tags:

  //https://datacache.ecalculator.pro/api/wallet/tag/list/?address=0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88
  const [eligibleTags, setEligibleTags] = useState<String[]>();
  const [allTags, setAllTags] = useState<String[]>();

  async function getEligibletagsForUser(walletAddress: string) {
    const resp = await fetch(`https://datacache.ecalculator.pro/api/wallet/tag/list/?address=${walletAddress}`);
    const lists = (await resp.json()).list as tags[];
    setEligibleTags(lists.map(({ name }) => name));
  }

  async function getAllTags() {
    const resp = await fetch(`https://datacache.ecalculator.pro/api/tag/list/`);
    const lists = (await resp.json()).list as tags[];
    setAllTags(lists.map(({ name }) => name));
  }

  useEffect(() => {
    if (!user) return;
    if (eligibleTags) return;
    if (allTags) return;

    //fetch the eligible tags
    getEligibletagsForUser('0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88');
    getAllTags();
  });

  useEffect(() => {
    console.log(eligibleTags, allTags);
  }, []);

  async function handleCreateCredentialRequest(e) {
    setLoading(true);
    e.preventDefault();
    console.log(eligibleTags);
    const props = {
      bigWhaleOfApecoin: eligibleTags.includes('BigWhale Of ApeCoin'),
      xMTPEnabled: eligibleTags.includes('XMTP Enabled'),
      eRC6551Supporter: eligibleTags.includes('ERC6551 Supporter'),
      worldcoinVerified: worldcoinVerified,
    };
    console.log(props);
    const credential = {
      schema: sampleSchema.url,
      issuer: DOCK_DID,
      name: sampleSchema.name,
      type: ['VerifiableCredential', sampleSchema.name],
      subject: sampleSchema.populateFunc(props),
    };

    console.log('-------');
    console.log('credential', credential);

    const { data } = await axios.post('api/create-credential/', credential);
    setClaimQR(data.qrUrl);
    setIsOpen(true);
    setLoading(false);
  }

  return (
    <>
      <Layout isHeaderTransparent={true}>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80 transition-opacity" />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-middle bg-gray-800 w-[80vw] h-[80vh] px-6 py-5 text-left overflow-y-auto shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:w-[80vw] sm:h-[80vh] sm:p-8">
              <div>
                <Dialog.Title className="text-2xl leading-6 font-bold text-white">View QR code</Dialog.Title>
                <div className="mt-2 bg-white w-full h-[70vh] relative">
                  {' '}
                  {/* Adjusted here */}
                  <iframe
                    src={claimQR}
                    allowTransparency={true}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-gray-900 bg-gray-600 border border-transparent rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Dialog>

        {user ? (
          <div className="w-4/5 m-auto">
            <h1 className="text-lg">Get verified by us for greater eligibility</h1>
            <div className="ml-5">
              {allTags &&
                allTags.map((tag) => {
                  return (
                    <div key={tag as any}>
                      <h2>{tag}</h2>
                      {eligibleTags?.includes(tag) ? (
                        <p className="text-green-500">Eligible based on chain analysis</p>
                      ) : (
                        <p className="text-red-700">Not eligible based on chain analysis</p>
                      )}
                      {/*eligibleTags && eligibleTags.filter((e) => e.name == tag.name) ? (
                    <p className="text-green-500">Eligible based on chain analysis</p>
                  ) : (
                    <p className="text-red-700">Not eligible based on chain analysis</p>
                  )*/}
                    </div>
                  );
                })}
              <h2>Worldcoin</h2>
              <p>
                <SignInWithWorldcoin
                  worldcoinVerified={worldcoinVerified}
                  setWorldcoinVerified={setWorldcoinVerified}
                />
              </p>
            </div>
            <div>
              <button onClick={handleCreateCredentialRequest} className="border p-3 my-3">
                Generate Proof
              </button>
              <div>{loading && <p>Loading...</p>}</div>
            </div>
          </div>
        ) : (
          <p>Connect your wallet</p>
        )}
      </Layout>
    </>
  );
}
