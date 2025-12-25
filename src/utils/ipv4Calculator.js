// IPv4 Calculator Utility Functions

export function maskToPrefix(mask) {
  const octets = mask.split('.').map(Number);
  let prefix = 0;
  for (const octet of octets) {
    prefix += (octet >>> 0).toString(2).split('1').length - 1;
  }
  return prefix;
}

export function prefixToMask(prefix) {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(8, Math.max(0, prefix - i * 8));
    mask.push(256 - Math.pow(2, 8 - bits));
  }
  return mask.join('.');
}

export function findInterestingOctet(mask) {
  const octets = mask.split('.').map(Number);
  for (let i = 0; i < 4; i++) {
    if (octets[i] !== 255 && octets[i] !== 0) {
      return { index: i, value: octets[i] };
    }
    if (octets[i] === 0) {
      return { index: i, value: 0 };
    }
  }
  return { index: 3, value: octets[3] };
}

export function calculateBlockSize(maskOctetValue) {
  return 256 - maskOctetValue;
}

export function findNetworkAddress(ip, mask) {
  const ipOctets = ip.split('.').map(Number);
  const maskOctets = mask.split('.').map(Number);
  const networkOctets = ipOctets.map((octet, i) => octet & maskOctets[i]);
  return networkOctets.join('.');
}

export function findBroadcastAddress(networkAddress, mask) {
  const networkOctets = networkAddress.split('.').map(Number);
  const maskOctets = mask.split('.').map(Number);
  const broadcastOctets = networkOctets.map((octet, i) => octet | (255 - maskOctets[i]));
  return broadcastOctets.join('.');
}

export function findFirstHost(networkAddress) {
  const octets = networkAddress.split('.').map(Number);
  octets[3] += 1;
  return octets.join('.');
}

export function findLastHost(broadcastAddress) {
  const octets = broadcastAddress.split('.').map(Number);
  octets[3] -= 1;
  return octets.join('.');
}

export function calculateTable1(hostIP, initialMask, newMask) {
  const steps = [];
  
  // Étape 1: Trouver le nombre de bits de sous-réseau
  const initialPrefix = maskToPrefix(initialMask);
  const newPrefix = maskToPrefix(newMask);
  const subnetBits = newPrefix - initialPrefix;
  
  steps.push({
    title: "Étape 1 : Trouver le nombre de bits de sous-réseau",
    explanation: `Convertir les deux masques en notation préfixe (/x) :
• Masque initial ${initialMask} = /${initialPrefix}
• Nouveau masque ${newMask} = /${newPrefix}
• Bits de sous-réseau = Nouveau préfixe − Préfixe initial = ${newPrefix} − ${initialPrefix} = ${subnetBits}`,
    result: `Nombre de bits de sous-réseau : ${subnetBits}`
  });

  // Étape 2: Trouver le nombre de sous-réseaux
  const numberOfSubnets = Math.pow(2, subnetBits);
  
  steps.push({
    title: "Étape 2 : Trouver le nombre de sous-réseaux",
    explanation: `Utiliser la formule : Nombre de sous-réseaux = 2^(bits de sous-réseau)
• Nombre de sous-réseaux = 2^${subnetBits} = ${numberOfSubnets}`,
    result: `Nombre de sous-réseaux : ${numberOfSubnets}`
  });

  // Étape 3: Trouver les bits d'hôte et le nombre d'hôtes par sous-réseau
  const hostBits = 32 - newPrefix;
  const totalAddresses = Math.pow(2, hostBits);
  const usableHosts = totalAddresses - 2;
  
  steps.push({
    title: "Étape 3 : Trouver les bits d'hôte et le nombre d'hôtes",
    explanation: `IPv4 a 32 bits au total.
• Bits d'hôte = 32 − nouveau préfixe = 32 − ${newPrefix} = ${hostBits}
• Adresses totales par sous-réseau = 2^${hostBits} = ${totalAddresses}
• Hôtes utilisables = 2^${hostBits} − 2 = ${usableHosts} (réseau et broadcast exclus)`,
    result: `Bits d'hôte : ${hostBits}, Hôtes utilisables : ${usableHosts}`
  });

  // Étape 4: Trouver l'adresse réseau avec la méthode du bloc
  const interesting = findInterestingOctet(newMask);
  const blockSize = calculateBlockSize(interesting.value);
  const ipOctets = hostIP.split('.').map(Number);
  const networkMultiple = Math.floor(ipOctets[interesting.index] / blockSize) * blockSize;
  const networkAddress = findNetworkAddress(hostIP, newMask);
  
  steps.push({
    title: "Étape 4 : Trouver l'adresse réseau (Méthode du bloc)",
    explanation: `Trouver l'octet "intéressant" (ni 255, ni 0) :
• Nouveau masque : ${newMask}
• Octet intéressant : position ${interesting.index + 1} avec valeur ${interesting.value}
• Taille du bloc = 256 − ${interesting.value} = ${blockSize}
• Valeur de l'octet IP à la position ${interesting.index + 1} : ${ipOctets[interesting.index]}
• Plus grand multiple de ${blockSize} ≤ ${ipOctets[interesting.index]} : ${networkMultiple}
• Adresse réseau : Garder les octets précédents, utiliser ${networkMultiple} pour l'intéressant, 0 pour le reste`,
    result: `Adresse réseau : ${networkAddress}`
  });

  // Étape 5: Trouver le premier hôte
  const firstHost = findFirstHost(networkAddress);
  
  steps.push({
    title: "Étape 5 : Trouver l'adresse du premier hôte",
    explanation: `Prendre l'adresse réseau et ajouter 1 au dernier octet :
• Adresse réseau : ${networkAddress}
• Premier hôte = ${networkAddress} + 1 dans le dernier octet`,
    result: `Premier hôte : ${firstHost}`
  });

  // Étape 6: Trouver l'adresse de broadcast
  const broadcastAddress = findBroadcastAddress(networkAddress, newMask);
  const nextSubnetValue = networkMultiple + blockSize;
  
  steps.push({
    title: "Étape 6 : Trouver l'adresse de broadcast",
    explanation: `Utiliser la méthode du bloc :
• Valeur réseau dans l'octet intéressant : ${networkMultiple}
• Valeur du prochain sous-réseau = ${networkMultiple} + ${blockSize} = ${nextSubnetValue}
• Broadcast = un de moins que le prochain sous-réseau dans la partie hôte
• Tous les bits d'hôte mis à 1`,
    result: `Adresse de broadcast : ${broadcastAddress}`
  });

  // Étape 7: Trouver le dernier hôte
  const lastHost = findLastHost(broadcastAddress);
  
  steps.push({
    title: "Étape 7 : Trouver l'adresse du dernier hôte",
    explanation: `Prendre l'adresse de broadcast et soustraire 1 du dernier octet :
• Adresse de broadcast : ${broadcastAddress}
• Dernier hôte = ${broadcastAddress} − 1 dans le dernier octet`,
    result: `Dernier hôte : ${lastHost}`
  });

  return {
    steps,
    results: {
      subnetBits,
      numberOfSubnets,
      hostBits,
      usableHosts,
      networkAddress,
      firstHost,
      lastHost,
      broadcastAddress
    }
  };
}

export function calculateTable2(ip, prefix) {
  const steps = [];
  const mask = prefixToMask(prefix);
  
  // Étape 1: Obtenir les bits d'hôte à partir du préfixe
  const hostBits = 32 - prefix;
  
  steps.push({
    title: "Étape 1 : Lire le préfixe et obtenir les bits d'hôte",
    explanation: `Le préfixe est /${prefix}
• Bits d'hôte = 32 − préfixe = 32 − ${prefix} = ${hostBits}`,
    result: `Nombre total de bits d'hôte : ${hostBits}`
  });

  // Étape 2: Calculer le nombre total d'hôtes
  const totalAddresses = Math.pow(2, hostBits);
  const usableHosts = totalAddresses - 2;
  
  steps.push({
    title: "Étape 2 : Calculer le nombre total d'hôtes",
    explanation: `Utiliser la formule : adresses totales = 2^(bits d'hôte)
• Adresses totales = 2^${hostBits} = ${totalAddresses}
• Hôtes utilisables = 2^${hostBits} − 2 = ${usableHosts}`,
    result: `Nombre total d'hôtes : ${totalAddresses}, Utilisables : ${usableHosts}`
  });

  // Étape 3: Trouver l'adresse réseau
  const interesting = findInterestingOctet(mask);
  const blockSize = calculateBlockSize(interesting.value);
  const ipOctets = ip.split('.').map(Number);
  const networkMultiple = Math.floor(ipOctets[interesting.index] / blockSize) * blockSize;
  const networkAddress = findNetworkAddress(ip, mask);
  
  let maskExplanation = `Convertir /${prefix} en masque de sous-réseau :\n`;
  maskExplanation += `• /${prefix} = ${mask}\n`;
  maskExplanation += `• Octet intéressant : position ${interesting.index + 1} avec valeur ${interesting.value}\n`;
  maskExplanation += `• Taille du bloc = 256 − ${interesting.value} = ${blockSize}\n`;
  maskExplanation += `• Valeur de l'octet IP à la position ${interesting.index + 1} : ${ipOctets[interesting.index]}\n`;
  maskExplanation += `• Plus grand multiple de ${blockSize} ≤ ${ipOctets[interesting.index]} : ${networkMultiple}`;
  
  steps.push({
    title: "Étape 3 : Trouver l'adresse réseau (Méthode du bloc)",
    explanation: maskExplanation,
    result: `Adresse réseau : ${networkAddress}`
  });

  // Étape 4: Trouver l'adresse de broadcast
  const broadcastAddress = findBroadcastAddress(networkAddress, mask);
  const nextSubnetValue = networkMultiple + blockSize;
  
  steps.push({
    title: "Étape 4 : Trouver l'adresse de broadcast",
    explanation: `Utiliser la méthode du bloc :
• Valeur réseau dans l'octet intéressant : ${networkMultiple}
• Valeur du prochain sous-réseau = ${networkMultiple} + ${blockSize} = ${nextSubnetValue}
• Broadcast = mettre tous les bits d'hôte à 1
• Pour les préfixes plus grands couvrant plusieurs octets, mettre les octets hôtes à 255`,
    result: `Adresse de broadcast : ${broadcastAddress}`
  });

  return {
    steps,
    results: {
      hostBits,
      totalHosts: totalAddresses,
      usableHosts,
      networkAddress,
      broadcastAddress
    }
  };
}
