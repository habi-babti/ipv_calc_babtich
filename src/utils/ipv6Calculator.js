// IPv6 Calculator Utility Functions

export function expandIPv6(ip) {
  // Remove leading/trailing spaces
  ip = ip.trim();
  
  // Handle :: expansion
  if (ip.includes('::')) {
    const parts = ip.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    const middle = Array(missing).fill('0000');
    const full = [...left, ...middle, ...right];
    return full.map(p => p.padStart(4, '0')).join(':');
  }
  
  // Just pad each group
  return ip.split(':').map(p => p.padStart(4, '0')).join(':');
}

export function compressIPv6(ip) {
  const expanded = expandIPv6(ip);
  let groups = expanded.split(':').map(g => g.replace(/^0+/, '') || '0');
  
  // Find longest run of zeros
  let longestStart = -1, longestLen = 0;
  let currentStart = -1, currentLen = 0;
  
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (currentStart === -1) currentStart = i;
      currentLen++;
      if (currentLen > longestLen) {
        longestStart = currentStart;
        longestLen = currentLen;
      }
    } else {
      currentStart = -1;
      currentLen = 0;
    }
  }
  
  if (longestLen > 1) {
    const before = groups.slice(0, longestStart).join(':');
    const after = groups.slice(longestStart + longestLen).join(':');
    return (before || '') + '::' + (after || '');
  }
  
  return groups.join(':');
}

export function getNetworkPrefix(ip, prefixLength) {
  const expanded = expandIPv6(ip);
  const hex = expanded.replace(/:/g, '');
  let binary = '';
  for (const char of hex) {
    binary += parseInt(char, 16).toString(2).padStart(4, '0');
  }
  
  // Keep only prefix bits, zero out the rest
  const networkBinary = binary.slice(0, prefixLength).padEnd(128, '0');
  
  // Convert back to hex
  let result = '';
  for (let i = 0; i < 128; i += 4) {
    result += parseInt(networkBinary.slice(i, i + 4), 2).toString(16);
  }
  
  // Format as IPv6
  const groups = [];
  for (let i = 0; i < 32; i += 4) {
    groups.push(result.slice(i, i + 4));
  }
  
  return compressIPv6(groups.join(':'));
}

export function getLastAddress(ip, prefixLength) {
  const expanded = expandIPv6(ip);
  const hex = expanded.replace(/:/g, '');
  let binary = '';
  for (const char of hex) {
    binary += parseInt(char, 16).toString(2).padStart(4, '0');
  }
  
  // Keep prefix bits, set all host bits to 1
  const lastBinary = binary.slice(0, prefixLength).padEnd(128, '1');
  
  // Convert back to hex
  let result = '';
  for (let i = 0; i < 128; i += 4) {
    result += parseInt(lastBinary.slice(i, i + 4), 2).toString(16);
  }
  
  // Format as IPv6
  const groups = [];
  for (let i = 0; i < 32; i += 4) {
    groups.push(result.slice(i, i + 4));
  }
  
  return compressIPv6(groups.join(':'));
}


export function calculateIPv6(ip, prefix) {
  const steps = [];
  
  // Étape 1: Expansion de l'adresse IPv6
  const expanded = expandIPv6(ip);
  
  steps.push({
    title: "Étape 1 : Expansion de l'adresse IPv6",
    explanation: `IPv6 utilise 128 bits (8 groupes de 16 bits en hexadécimal).
• Adresse entrée : ${ip}
• Adresse complète : ${expanded}
• Chaque groupe est complété à 4 chiffres hexadécimaux`,
    result: `Adresse complète : ${expanded}`
  });

  // Étape 2: Calcul des bits d'hôte
  const hostBits = 128 - prefix;
  
  steps.push({
    title: "Étape 2 : Calculer les bits d'hôte",
    explanation: `IPv6 a 128 bits au total.
• Préfixe : /${prefix}
• Bits d'hôte = 128 − ${prefix} = ${hostBits}`,
    result: `Nombre de bits d'hôte : ${hostBits}`
  });

  // Étape 3: Calcul du nombre d'adresses
  const totalAddresses = hostBits <= 64 ? Math.pow(2, hostBits) : null;
  const addressDisplay = totalAddresses !== null 
    ? totalAddresses.toLocaleString('fr-FR')
    : `2^${hostBits} (nombre très grand)`;
  
  steps.push({
    title: "Étape 3 : Calculer le nombre d'adresses",
    explanation: `Nombre total d'adresses = 2^(bits d'hôte)
• Nombre d'adresses = 2^${hostBits}
• ${hostBits > 64 ? 'Ce nombre est extrêmement grand (plus de 18 quintillions)' : `= ${addressDisplay}`}`,
    result: `Nombre d'adresses : ${addressDisplay}`
  });

  // Étape 4: Trouver le préfixe réseau
  const networkPrefix = getNetworkPrefix(ip, prefix);
  
  steps.push({
    title: "Étape 4 : Trouver le préfixe réseau",
    explanation: `Garder les ${prefix} premiers bits et mettre les bits d'hôte à 0.
• Adresse : ${expanded}
• Préfixe /${prefix} : garder les ${prefix} premiers bits
• Mettre les ${hostBits} bits restants à 0`,
    result: `Préfixe réseau : ${networkPrefix}/${prefix}`
  });

  // Étape 5: Trouver la dernière adresse
  const lastAddress = getLastAddress(ip, prefix);
  
  steps.push({
    title: "Étape 5 : Trouver la dernière adresse",
    explanation: `Garder les ${prefix} premiers bits et mettre tous les bits d'hôte à 1.
• Préfixe réseau : ${networkPrefix}
• Mettre les ${hostBits} bits d'hôte à 1`,
    result: `Dernière adresse : ${lastAddress}`
  });

  // Étape 6: Résumé de la plage
  steps.push({
    title: "Étape 6 : Plage d'adresses complète",
    explanation: `La plage d'adresses pour ce sous-réseau :
• Première adresse : ${networkPrefix}
• Dernière adresse : ${lastAddress}
• Notation préfixe : ${networkPrefix}/${prefix}`,
    result: `Plage : ${networkPrefix} → ${lastAddress}`
  });

  return {
    steps,
    results: {
      expandedAddress: expanded,
      hostBits,
      totalAddresses: addressDisplay,
      networkPrefix,
      lastAddress,
      cidrNotation: `${networkPrefix}/${prefix}`
    }
  };
}
