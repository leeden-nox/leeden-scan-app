import { useEffect, useState } from "react";

const BrowserPrint = window.BrowserPrint;

export function useBrowserPrint() {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!BrowserPrint) {
      setError("BrowserPrint not found");
      return;
    }

    try {
      BrowserPrint.getDefaultDevice(
        "printer",
        (device) => {
          const printerList = [];
          printerList.push(device);
          setSelectedPrinter(device);

          BrowserPrint.getLocalDevices(
            (devices) => {
              devices.forEach((d) => {
                if (d.uid !== device.uid) {
                  printerList.push(d);
                }
              });
              setPrinters(printerList);
            },
            () => setError("Error getting local devices"),
            "printer"
          );
        },
        (err) => setError(err)
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const print = (zpl) => {
    if (!selectedPrinter) {
      setError("No printer selected");
      return;
    }

    selectedPrinter.send(
      zpl,
      undefined,
      (err) => setError(err)
    );
  };

  return {
    printers,
    selectedPrinter,
    setSelectedPrinter,
    print,
    error,
  };
}
