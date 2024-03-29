import React, { useState, useEffect } from "react";
import createCtx from "./Index";

export const [useShoppingCart, CtxProvider] = createCtx();

export default function ShoppingCartProvider(props) {
  const [positions, setPositions] = useState([]);

  useEffect(async () => {
    await loadFromLocalStorage();
  }, []);

  useEffect(async () => {
    await saveToLocalStorage();
  }, [positions]);

  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(",")[1]);
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async function saveToLocalStorage() {
    let tmpPositions = positions.slice();
    for (let i = 0; i < tmpPositions.length; i++) {
      let tmp = tmpPositions[i];
      tmp.data = tmp.blob ? await readFileAsync(tmp.blob) : "";
    }
    localStorage.setItem("positions_data", JSON.stringify(tmpPositions));
  }

  async function loadFromLocalStorage() {
    let data = localStorage.getItem("positions_data");
    let tmpPositions = JSON.parse(data);
    if (data) {
      if (tmpPositions && tmpPositions.length >= 0) {
        for (let i = 0; i < tmpPositions.length; i++) {
          let tmp = tmpPositions[i];
          tmp.blob = tmp.data ? dataURItoBlob(tmp.data) : "";
        }
      }
      setPositions(tmpPositions);
    } else {
      setPositions([]);
    }
  }

  const addPosition = async (blob, name, count, singlePrice, color) => {
    let result = false;
    let tmpPositions = positions.slice();
    if (
      count &&
      count > 0 &&
      name &&
      blob &&
      singlePrice &&
      singlePrice > 0 &&
      color
    ) {
      let equalPosition = tmpPositions.filter(
        (p) => p.name === name && p.color.name === color.name
      );
      if (equalPosition && equalPosition.length > 0) {
        changePosition(name, equalPosition[0].count + count, color);
      } else {
        tmpPositions.push({ blob, name, count, singlePrice, color });
        setPositions(tmpPositions);
      }
      result = true;
    }
    return result;
  };

  const changePosition = async (name, count, color) => {
    let tmpPositions = positions.slice();
    let data = tmpPositions.find(
      (p) => p.name === name && p.color.name === color.name
    );
    if (data) {
      if (count > 0) {
        data.count = count;
        setPositions(tmpPositions);
      } else {
        removePosition(name, color);
      }
    }
  };

  const removePosition = async (name, color) => {
    let tmpPositions = positions.slice();
    tmpPositions = tmpPositions.filter(
      (p) => !(p.name === name && p.color.name === color.name)
    );
    setPositions(tmpPositions);
  };

  const clearCart = async () => {
    setPositions([]);
  };

  const contextValue = {
    positions,
    addPosition,
    changePosition,
    removePosition,
    clearCart,
  };
  return <CtxProvider value={contextValue}>{props.children}</CtxProvider>;
}
