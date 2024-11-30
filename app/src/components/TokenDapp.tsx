import React, { useCallback, useEffect, useMemo } from "react";
import { FC, useState } from "react";
import gridStyles from "../styles/App.module.css";
import { TxStatus } from "./TxStatus";
import { AlephiumConnectButton, useBalance, useConnect, useWallet } from "@alephium/web3-react";
import { addressFromTokenId, hexToString, node, ONE_ALPH } from "@alephium/web3";
import {
  contractFactory,
  getGridCoordinates,
  getIndexFromCoordinates,
  getPx,
  getTokenList,
  gridSize,
  TokenFaucetConfig,
  Token,
  cartesianToByteVec,
} from "@/services/utils";
import { mintPx, resetPx } from "@/services/token.service";
import { PixelFactoryTypes } from "my-contracts";
import styles from "../styles/Stats.module.css";

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FFFF33",
  "#FF33FF",
  "#33FFFF",
  "#FFFFFF",
  "#000000",
  "#888888",
  "#FF8800",
  "#0088FF",
  "#066639",
  "#8800FF",
  "#FF0088",
  "#bf0404",
  "#008888",
];

interface Pixel {
 color: string,
 isShiny: boolean  
}


export const TokenDapp: FC<{
  config: TokenFaucetConfig;
}> = ({ config }) => {
  const { signer, account, connectionStatus } = useWallet();
  const {balance, updateBalanceForTx} = useBalance();
  const [ongoingTxId, setOngoingTxId] = useState<string>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [contractState, setContractState] =useState<PixelFactoryTypes.State | null>(null);
  const [pixels, setPixels] = useState<Pixel[]>(Array(gridSize * gridSize).fill({color: "#333"}));
  const [loading, setLoading] = useState(true); // Loading state
  const [eventData, setEventData] =
    useState<PixelFactoryTypes.PixelSetEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<Token | undefined>();
  const [isResetModal, setIsResetModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | undefined>(0);
  const [insufficientTokens, setInsufficientTokens] = useState(false);
  const [eventCounter, setEventCounter] = useState(0)
  const [contractEventsCount, setContractEventsCount] = useState(0)
  const [eventsReceived, setEventsReceived] = useState<(PixelFactoryTypes.PixelSetEvent | PixelFactoryTypes.PixelResetEvent)[]>([])
  const [showConnectMessage, setShowConnectMessage] = useState(false);
  const [pendingPixelClick, setPendingPixelClick] = useState<number | null>(null);

  useEffect(() => {
    async function subscribeEvent() {
      const currentCount = await contractFactory.getContractEventsCurrentCount()
      setContractEventsCount(currentCount)

      contractFactory.subscribeAllEvents({
        pollingInterval: 1000,
        messageCallback: async (event: PixelFactoryTypes.PixelSetEvent
          | PixelFactoryTypes.PixelResetEvent): Promise<void> => {
          setEventsReceived(prev => {
            const newEvents = [...prev, event];
            const uniqueBlockhashes = new Set(newEvents.map(e => e.blockHash));
            setEventCounter(uniqueBlockhashes.size);
            return newEvents;
          });
          return Promise.resolve();
        },
        errorCallback: (error: any, subscription: { unsubscribe: () => void; }): Promise<void> => {
          console.error("Error received:", error);
          setError(error.message);
          subscription.unsubscribe();
          return Promise.resolve();
        },
      });
    }
    subscribeEvent();
  }, []);

  useEffect(() => {
    if (eventCounter >= contractEventsCount && contractEventsCount > 0) {
      const newPixels = Array(gridSize * gridSize).fill({color: "#333"}); // Default color for all pixels

      eventsReceived.forEach(event => {
        const indexNewPx = getIndexFromCoordinates(
          Number(event.fields.x),
          Number(event.fields.y)
        );

        if (event.name === 'PixelSet' && 'color' in event.fields) {
          const pixelColor = `#${hexToString(event.fields.color)}`;
          newPixels[indexNewPx] = {
            color: pixelColor,
            isShiny: false
          } // Set regular pixel color

         if(event.fields.isShiny){
            newPixels[indexNewPx] = {
               color: pixelColor,
               isShiny: true
             } // Set regular pixel color
          }
         
       
        }else if (event.name === 'PixelReset') {
         newPixels[indexNewPx] = {color: '#333', isShiny: false};
       }
      });

      setPixels(newPixels);
      setLoading(false);
    }
  }, [eventCounter, contractEventsCount, eventsReceived]);


  useEffect(() => {
    if(connectionStatus === "connected" && contractState !== null && balance !== undefined){
      const tokenBalanceWallet = balance.tokenBalances?.find(
        (token: { id: string; }) => token.id === contractState.fields.tokenIdToBurn
      )
      
      setTokenBalance(tokenBalanceWallet?.amount)
      if(tokenBalanceWallet == undefined) setTokenBalance(0);

    }
  }, [balance, connectionStatus,contractState]);

  useEffect(() => {
    const initializePixels = async () => {
      const contractState = await contractFactory.fetchState();
      const tokenList = await getTokenList();

      setContractState(contractState);
      setTokenMetadata(
        tokenList?.find(
          (token) => token.id === contractState.fields.tokenIdToBurn
        )
      );

      setLoading(false); // Stop loading once initialized
    };

    initializePixels();
  }, []);

  const handlePixelClick = useCallback(
    (index: number) => {
      if (connectionStatus !== "connected") {
        setShowConnectMessage(true);
        setPendingPixelClick(index);
        return;
      }

      const currentPixel = pixels[index];
      setSelectedPixel(index);

      // Check if the pixel is uncolored
      if (currentPixel.color === "#333") {
        // Show the mint modal for uncolored pixels
        setIsResetModal(false);
        setModalVisible(true);
      } else {
        // Show the reset modal for colored pixels
        setIsResetModal(true);
        setModalVisible(true);
      }
    },
    [pixels, connectionStatus]
  );

  const handleColorClick = useCallback(
    (color: React.SetStateAction<string | null>) => {
      setSelectedColor(color);
    },
    []
  );

  const handleColorSubmit = useCallback(async () => {

    if (selectedPixel !== null && selectedColor) {
      // Check if user has enough tokens
      if (contractState && tokenBalance !== undefined && tokenMetadata) {
        const requiredAmount = Number(contractState.fields.burnMint);
        if (tokenBalance < requiredAmount) {
          setInsufficientTokens(true);
          return;
        }
      }

      setPixels((prevPixels) => {
        const newPixels = [...prevPixels];
        newPixels[selectedPixel] = {color: selectedColor, isShiny: false};
        return newPixels;
      });

      if (signer && contractState !== null) {
        // Get 1-based coordinates
        const [x, y] = getGridCoordinates(selectedPixel);
        // Convert to BigInt and subtract 1 to make 0-based
        const result = await mintPx(
          signer,
          contractState.fields.tokenIdToBurn,
          x,
          y,
          selectedColor,
          contractState.fields.burnMint,
          false
        );

        updateBalanceForTx(result.txId);
        setOngoingTxId(result.txId);
      }
      setModalVisible(false);
      //setSelectedColor(null);
      setSelectedPixel(null);
    }
  }, [selectedPixel, selectedColor, contractState, tokenBalance, tokenMetadata]);

  const handleResetSubmit = async () => {

    if (selectedPixel != 0 && !selectedPixel) return;
    const [x, y] = getGridCoordinates(selectedPixel);

    setPixels((prevPixels) => {
      const newPixels = [...prevPixels];
      newPixels[selectedPixel] = {color: '#333', isShiny: false};
      return newPixels;
    });
    try {
      if (signer && contractState !== null) {
        const result = await resetPx(signer, x, y);
        console.log(`Reset transaction submitted: ${result.txId}`);
        updateBalanceForTx(result.txId);

        closeModal();
      }
      // ... rest of your transaction handling
    } catch (error) {
      console.error("Error resetting pixel:", error);
    }
  };

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedColor(null);
    setSelectedPixel(null);
  }, []);

 /* const memoizedPixels = useMemo(
    () =>
      pixels.map((color, index) => {
        const pixelData = eventsReceived.find(event => {
          const indexNewPx = getIndexFromCoordinates(Number(event.fields.x), Number(event.fields.y));
          return indexNewPx === index && event.name === 'PixelSet';
        });

        const isShiny = pixelData ? pixelData.fields.isShiny : false;

        return (
          <div
            key={index}
            className={`${gridStyles.pixel} ${isShiny ? gridStyles.blink : ''}`}
            style={{ backgroundColor: isShiny ? color : color }} // Use the color for both shiny and non-shiny
            onClick={() => handlePixelClick(index)}
            title={`${getGridCoordinates(index)[0]}, ${getGridCoordinates(index)[1]}`}
          />
        );
      }),
    [pixels, eventsReceived, handlePixelClick]
  );*/


  const memoizedPixels = useMemo(
   () =>
     pixels.map((pixel, index) => (
       <div
         key={index}
         className={`${gridStyles.pixel} ${pixel.isShiny ? gridStyles.blink : ''}`}
         style={{  backgroundColor: pixel.color  }}
         onClick={() => handlePixelClick(index)}
         title={`${getGridCoordinates(index)[0]}, ${
           getGridCoordinates(index)[1]
         }`}
       />
     )),
   [pixels, handlePixelClick]
 );

  useEffect(() => {
    if (connectionStatus === "connected") {
      setShowConnectMessage(false);
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (connectionStatus === "connected" && pendingPixelClick !== null) {
      const currentColor = pixels[pendingPixelClick];
      setSelectedPixel(pendingPixelClick);
      if (currentColor.color === "#333") {
        setIsResetModal(false);
        setModalVisible(true);
      } else {
        setIsResetModal(true);
        setModalVisible(true);
      }
      setPendingPixelClick(null);
      setShowConnectMessage(false);
    }
  }, [connectionStatus, pendingPixelClick, pixels]);

  const handleShinyColorSubmit = useCallback(async () => {
    if (selectedPixel !== null && selectedColor) {
      // Check if user has enough tokens
      if (contractState && tokenBalance !== undefined && tokenMetadata) {
        const requiredAmount = Number(contractState.fields.burnMint) * Number(contractState.fields.shinyMultiplier); // 10x for shiny
        if (tokenBalance < requiredAmount) {
          setInsufficientTokens(true);
          return;
        }
      }

      setPixels((prevPixels) => {
        const newPixels = [...prevPixels];
        newPixels[selectedPixel] = {color: selectedColor, isShiny: true}; // Update color
        return newPixels;
      });

      if (signer && contractState !== null) {
        const [x, y] = getGridCoordinates(selectedPixel);
        const result = await mintPx(
          signer,
          contractState.fields.tokenIdToBurn,
          x,
          y,
          selectedColor,
          contractState.fields.burnMint * BigInt(10), // 10x for shiny
          true // Set isShiny to true
        );

        updateBalanceForTx(result.txId);
        setOngoingTxId(result.txId);
      }
      setModalVisible(false);
      setSelectedPixel(null);
    }
  }, [selectedPixel, selectedColor, signer, contractState, tokenBalance]);

  return (
    <>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>
            Loading the pixel grid...
          </p>
        </div>
      )}
      {contractState !== null && (
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Minted Pixels</div>
            <div className={styles.statValue}>
              {Number(contractState.fields.numPxMinted)} / {gridSize * gridSize}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Tokens Burned</div>
            <div className={styles.statValue}>
              {tokenMetadata !== undefined ? (
                <>
                  {Number(contractState.fields.balanceBurn) /
                    10 ** tokenMetadata?.decimals}{" "}
                  {tokenMetadata.symbol}
                  <img
                    src="https://i.gifer.com/origin/a9/a95ef9bce2a1d53accc6a8018df04ff6_w200.gif"
                    alt="fire"
                    className={styles.fireIcon}
                  />
                </>
              ) : (
                0
              )}
            </div>
          </div>
        </div>
      )}

      <main>
        <div id={gridStyles.gridContainer}>
          <div id={gridStyles.grid}>{memoizedPixels}</div>
        </div>
      </main>
      {modalVisible && !isResetModal && (
        <div className={gridStyles.modal}>
          <div className={gridStyles.modalContent}>
            <span className={gridStyles.close} onClick={closeModal}>
              &times;
            </span>
            <h2>
              Select a color for pixel at{" "}
              {`${selectedPixel && getGridCoordinates(selectedPixel)[0]}, ${
                selectedPixel && getGridCoordinates(selectedPixel)[1]
              }`}
            </h2>
            <p>Contract Fee: <strong>0.1 ALPH</strong></p>

            <p>
              You will burn:<strong>{" "}
              {contractState !== null && tokenMetadata !== undefined
                ? `${
                    Number(contractState.fields.burnMint) /
                    10 ** tokenMetadata.decimals
                  } ${tokenMetadata?.symbol}`
                : "0"}
                </strong>
            </p>

            <p>
              <b>Shiny pixels burn {Number(contractState?.fields.shinyMultiplier)}x more than normal pixels:{" "}
              {contractState !== null && tokenMetadata !== undefined
                ? `${
                    Number(contractState.fields.burnMint) /
                    10 ** tokenMetadata.decimals * Number(contractState?.fields.shinyMultiplier)
                  } ${tokenMetadata?.symbol}`
                : "0"}</b>
            </p>
            
            <div id="colorOptions">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`${gridStyles.colorOption} ${
                    selectedColor === color ? gridStyles.selected : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
            <button id="submitColor" onClick={handleColorSubmit} disabled={!selectedColor}>
            {selectedColor ? 'Mint' : 'Choose a color'}
            </button>

            <button id="makeItShineButton" onClick={handleShinyColorSubmit} disabled={!selectedColor}>
            {selectedColor ? 'Make it Shine' : 'Choose a color'}
            </button>
          </div>
        </div>
      )}

      {modalVisible && isResetModal && (
        <div className={gridStyles.modal}>
          <div className={gridStyles.modalContent}>
          <span className={gridStyles.close} onClick={closeModal}>
              &times;
            </span>
          <h2>
              Change pixel at{" "}
              {`${selectedPixel && getGridCoordinates(selectedPixel)[0]}, ${
                selectedPixel && getGridCoordinates(selectedPixel)[1]
              }`}
            </h2>
            {selectedColor && <p>
              You will burn:{" "}
              {contractState !== null && tokenMetadata !== undefined
                ? `${
                    Number(contractState.fields.burnMint) /
                    10 ** tokenMetadata.decimals
                  } ${tokenMetadata?.symbol}`
                : "0"}
            </p>}
          <div id="colorOptions">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`${gridStyles.colorOption} ${
                    selectedColor === color ? gridStyles.selected : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
           
            
            <button id="resetColor" onClick={handleResetSubmit}>
              Reset Pixel
            </button>
            &nbsp;
            <button id="submitColor" onClick={handleColorSubmit} disabled={!selectedColor}>
            {selectedColor ? 'Recolor' : 'Choose a color'}
            
            </button>
          </div>
        </div>
      )}

      {insufficientTokens && (
        <div className={gridStyles.modal}>
          <div className={gridStyles.modalContent}>
            <span className={gridStyles.close} onClick={() => setInsufficientTokens(false)}>
              &times;
            </span>
            <h2>Insufficient Tokens</h2>
            <p>You don't have enough tokens to perform this action.</p>
            <p>Required: {contractState && tokenMetadata ? 
              `${Number(contractState.fields.burnMint) / 10 ** tokenMetadata.decimals} ${tokenMetadata.symbol}` 
              : '0'
            }</p>
            <p>Your balance: {tokenBalance && tokenMetadata ? 
              `${tokenBalance / 10 ** tokenMetadata.decimals} ${tokenMetadata.symbol}` 
              : '0'
            }</p>
            <button onClick={() => {
              if (contractState?.fields.tokenIdToBurn) {
                window.open(`https://www.elexium.finance/swap?tokenA=tgx7VNFoP9DJiFMFgXXtafQZkUvyEdDHT9ryamHJYrjq&tokenB=${addressFromTokenId(contractState.fields.tokenIdToBurn)}`, '_blank');
              }
              setInsufficientTokens(false);
            }}>
              Get Tokens
            </button>
          </div>
        </div>
      )}

      {showConnectMessage && connectionStatus !== "connected" && (
        <div className={gridStyles.modal}>
          <div className={gridStyles.modalContent}>
            <span 
              className={gridStyles.close} 
              onClick={() => setShowConnectMessage(false)}
            >
              &times;
            </span>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to interact with the pixel grid.</p>
            <div className={gridStyles.connectButtonWrapper}>
              <AlephiumConnectButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
