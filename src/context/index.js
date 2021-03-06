import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useCallback,
    useEffect,
} from "react";
import Axios from "axios";

import { ethers } from "ethers";
import { useWallet } from "use-wallet";
import {
    providers, tokenContract, presaleContract, storeContract
} from "../contracts";

import { delay, toBigNum, fromBigNum } from "../utils/";
import { NotificationManager } from "react-notifications";

const BlockchainContext = createContext();

export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state, { type, payload }) {
    return {
        ...state,
        [type]: payload,
    };
}

const INIT_STATE = {
    signer: "",
    provider: "",
    allowance: 0,
    tokenBalance: 0,
    ethBalance: 0,
    price: 3000,
    histories: [],
    players: [],
    poolBalance: []
};

export default function Provider({ children }) {
    const wallet = useWallet();
    const [state, dispatch] = useReducer(reducer, INIT_STATE);

    // set signer balance
    useEffect(() => {
        const getSigner = async () => {
            if (wallet.status === "connected") {
                const provider = new ethers.providers.Web3Provider(
                    wallet.ethereum
                );
                const signer = await provider.getSigner();

                dispatch({
                    type: "provider",
                    payload: provider,
                });
                dispatch({
                    type: "signer",
                    payload: signer,
                });
            }
        };
        getSigner();
    }, [wallet.status]);

    useEffect(() => {
        const checking = async () => {
            try {
                await checkBalance();
            } catch (err) {
                console.log("balance check error")
            }
        }

        if (state.signer !== "") {
            if (wallet.status === "connected") {
                checking();
            }
        }
    }, [state.signer]);

    const checkBalance = async () => {
        try {
            var signedTokenContract = tokenContract.connect(state.signer);

            var userAddress = await state.signer.getAddress();

            signedTokenContract.allowance(userAddress, storeContract.address).then((res) => {
                console.log("set allowance")
                dispatch({
                    type: "allowance",
                    payload: fromBigNum(res)
                });
            });

            var tokenBalance = fromBigNum(await signedTokenContract.balanceOf(userAddress), 18);

            var ethBalance = fromBigNum(await state.provider.getBalance(userAddress), 18);

            dispatch({
                type: "tokenBalance",
                payload: tokenBalance
            });

            dispatch({
                type: "ethBalance",
                payload: ethBalance
            })

            return {
                tokenBalance,
                ethBalance
            }
        } catch (err) {
            console.log(err);
            NotificationManager.error("Check balance error");

            dispatch({
                type: "tokenBalance",
                payload: 0
            });
            dispatch({
                type: "ethBalance",
                payload: 0
            });
            dispatch({
                type: "allowance",
                payload: 0
            });

            return {
                tokenBalance: 0,
                ethBalance: 0
            }
        }
    }

    const getTerms = async () => {
        try {
            var terms = await presaleContract.terms;
            dispatch({
                type: "terms",
                payload: terms
            });

            var price = await presaleContract.getPrice();
            dispatch({
                type: "price",
                payload: fromBigNum(price, 6)
            });
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getTerms();
        updatePoolInfos();
    }, []);

    /* --------- actions ---------*/
    const buy = async (amount) => {
        console.log(amount);
        try {
            var signedPresaleContract = presaleContract.connect(state.signer);
            var tx = await signedPresaleContract.buy({ value: toBigNum(amount, 18) });
            await tx.wait();
            NotificationManager.success("Buy Success");
        } catch (err) {
            console.log(err);
            NotificationManager.error("Buy error");
        }
    }

    const deposit = async (amount) => {
        try {
            console.log(state.allowance, amount);
            if (Number(state.allowance) < Number(amount)) {
                var signedTokenContract = tokenContract.connect(state.signer);
                var tx = await signedTokenContract.approve(storeContract.address, toBigNum(amount, 18))
                await tx.wait();
            }
            var signedStoreContract = storeContract.connect(state.signer);
            var tx = await signedStoreContract.deposit(toBigNum(amount, 18));
            await tx.wait();
            NotificationManager.success("Deposit " + amount + "RD Success");
        } catch (err) {
            console.log(err);
            NotificationManager.error("deposit error",err.message);
        }
    }

    const signMessage = async (message) => {
        if (!!state.signer) {
            const signature = await state.signer.signMessage(message);
            return signature;
        } else {
            throw new Error("Please connect wallet!")
        }
    }

    // get info
    const getHistory = async () => {
        try {
            var res = await Axios.get(process.env.REACT_APP_BACKEND + "/api/get-histories");
            console.log("history", res.data.data)
            dispatch({
                type: "histories",
                payload: res.data.data,
            })

        } catch (err) {
            console.log("get history error: ", err.message);
        }
    }

    const getPlayers = async () => {
        try {
            var res = await Axios.get(process.env.REACT_APP_BACKEND + "/api/get-players");
            console.log("players", res.data.data)
            dispatch({
                type: "players",
                payload: res.data.data,
            })

        } catch (err) {
            console.log("get players error: ", err.message);
        }
    }

    const getPoolBalance = async () => {  
        try {
            var balance = await tokenContract.balanceOf(storeContract.address);
            console.log("poolBalance", ethers.utils.formatUnits(balance, 18))
            dispatch({
                type: "poolBalance",
                payload: ethers.utils.formatUnits(balance, 18),
            })

        } catch (err) {
            console.log("get poolBalance error: ", err.message);
        }
    }

    const updatePoolInfos = async () => {
        getHistory();
        getPlayers();
        getPoolBalance();
    }

    return (
        <BlockchainContext.Provider
            value={useMemo(
                () => [
                    state,
                    {
                        checkBalance,
                        buy,
                        deposit,
                        signMessage
                    }
                ],
                [state]
            )}>
            {children}
        </BlockchainContext.Provider>
    );
}
