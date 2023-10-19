import React from "react";
import "../utilities.css";

interface HeroProps {
  login: () => void;
  wallet: any;
  loading: boolean;
}

const Hero: React.FC<HeroProps> = ({ login, wallet, loading }) => {
  return (
    <div className="hero min-h-[100vh] bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div>
          <h1 className="text-5xl font-extrabold text-black max-w-[70%]">
            The only platform to simplify investing!
          </h1>
          <p className="py-6 text-[20px] max-w-[70%]">
            Level Up Your DeFi Game: Introducing Our Asset Protection, Automatic
            Portfolio Rebalancing Vault and more such automations for you!
          </p>
          <div className="flex">
            {!wallet && (
              <div>
                {loading ? (
                  <button
                    className="btn btn-primary mr-[20px]"
                    onClick={login}
                    disabled
                  >
                    Getting ready
                  </button>
                ) : (
                  <button className="btn btn-primary mr-[20px]" onClick={login}>
                    Get Started
                  </button>
                )}
              </div>
            )}
            <div className="flex flex-row items-center">
              <h1 className="text-3xl font-extrabold text-gray-400">
                Gasless, Easy, Secure
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
