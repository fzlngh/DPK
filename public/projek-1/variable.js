function tambah() {
      let a = Number(document.getElementById("a").value);
      let b = Number(document.getElementById("b").value);
      document.getElementById("hasil").innerText = a + b;
    }

    function kurang() {
      let a = Number(document.getElementById("a").value);
      let b = Number(document.getElementById("b").value);
      document.getElementById("hasil").innerText = a - b;
    }

    function kali() {
      let a = Number(document.getElementById("a").value);
      let b = Number(document.getElementById("b").value);
      document.getElementById("hasil").innerText = a * b;
    }

    function bagi() {
      let a = Number(document.getElementById("a").value);
      let b = Number(document.getElementById("b").value);
      if (b === 0) {
        document.getElementById("hasil").innerText = "Tidak bisa dibagi 0";
      } else {
        document.getElementById("hasil").innerText = a / b;
      }
    }