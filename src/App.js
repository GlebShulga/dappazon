import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import Product from "./components/Product";

// ABIs
import Dappazon from "./abis/Dappazon.json";

import config from "./config.json";
import { PRODUCTS_QTY } from "./constants/common";
import { CategoriesTitle } from "./constants/products";
import { isObjectEmpty } from "./helpers/object-utils";

function App() {
  const [provider, setProvider] = useState(null);
  const [dappazon, setDappazon] = useState(null);
  const [account, setAccount] = useState(null);
  const [categories, setCategories] = useState({});
  const [item, setItem] = useState(null);
  const [toggle, setToggle] = useState(false);

  const togglePop = (item) => {
    setItem(item);
    setToggle(() => !toggle);
  };

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      const network = await provider.getNetwork();

      const dappazon = new ethers.Contract(
        config[network.chainId].dappazon.address,
        Dappazon,
        provider
      );
      setDappazon(dappazon);

      const items = [];
      const categories = {};

      for (let i = 0; i < PRODUCTS_QTY; i++) {
        const item = await dappazon.items(i + 1);
        const category = item.category;
        if (!categories[category]) {
          categories[category] = [];
        }
        items.push(item);
        categories[category].push(item);
      }
      setCategories(categories);
    } else {
      alert("Metamask not installed");
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Dappazon Best Sellers</h2>
      {!isObjectEmpty(categories) &&
        Object.keys(categories).map((category) => (
          <Section
            key={category}
            title={CategoriesTitle[category]}
            items={categories[category]}
            togglePop={togglePop}
          />
        ))}
      {toggle && (
        <Product
          item={item}
          provider={provider}
          account={account}
          dappazon={dappazon}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
