import React from "react";

interface NavbarProps {
  action: () => void;
  type: string;
  loading: boolean;
  wallet: any;
}

const Navbar: React.FC<NavbarProps> = ({ action, type, loading, wallet }) => {
  return (
    <div className="navbar bg-base-200 w-[95%] m-auto pt-[20px]">
      <div className="navbar-start">
        <div className="dropdown">
          <div className="flex text-4xl">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-red-600">
              ProtectoLink!
            </h1>
            <span className="ml-[4px]">🏔️</span>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="navbar-end">
          {wallet! && (
            <a
              className="text-[16px] mx-[6px]"
              href={`http://mumbai.polygonscan.com/address/${wallet}`}
              target="_blank"
              rel="noreferrer"
            >
              {wallet?.slice(0, 4)}.....{wallet?.slice(38, 43)}
            </a>
          )}

          <button className="btn" onClick={action}>
            {type}
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
