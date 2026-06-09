export interface BankBranch {
  ifsc: string;
  branchName: string;
  city: string;
  state: string;
  address: string;
}

export interface BankInfo {
  bankId: string;
  bankName: string;
  branches: BankBranch[];
}

export const INDIAN_BANKS: BankInfo[] = [
  {
    bankId: "hdfc",
    bankName: "HDFC Bank",
    branches: [
      {
        ifsc: "HDFC0000104",
        branchName: "Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        address: "No. 548, Chinmaya Mission Hospital Road, Indiranagar, Bengaluru, 560038"
      },
      {
        ifsc: "HDFC0000058",
        branchName: "Koramangala",
        city: "Bengaluru",
        state: "Karnataka",
        address: "100 Feet Road, 4th Block, Koramangala, Bengaluru, 560034"
      },
      {
        ifsc: "HDFC0001045",
        branchName: "Jayanagar 4th Block",
        city: "Bengaluru",
        state: "Karnataka",
        address: "No. 12, 11th Main, Jayanagar 4th Block, Bengaluru, 560011"
      },
      {
        ifsc: "HDFC0001235",
        branchName: "Electronic City Phase 1",
        city: "Bengaluru",
        state: "Karnataka",
        address: "Velankani Drive, Electronic City Phase 1, Bengaluru, 560100"
      },
      {
        ifsc: "HDFC0000047",
        branchName: "Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Hill Road Branch, Bandra West, Mumbai, 400050"
      },
      {
        ifsc: "HDFC0000240",
        branchName: "Andheri East",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Sahar Road, Near Railway Station, Andheri East, Mumbai, 400069"
      },
      {
        ifsc: "HDFC0000012",
        branchName: "Nariman Point",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Tulsiani Chambers, Free Press Journal Marg, Nariman Point, Mumbai, 400021"
      },
      {
        ifsc: "HDFC0000003",
        branchName: "Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        address: "H-5, Kasturba Gandhi Marg, Connaught Place, New Delhi, 110001"
      },
      {
        ifsc: "HDFC0000122",
        branchName: "Saket",
        city: "New Delhi",
        state: "Delhi",
        address: "Community Center, Pushp Vihar, Saket, New Delhi, 110017"
      },
      {
        ifsc: "HDFC0000084",
        branchName: "Gachibowli",
        city: "Hyderabad",
        state: "Telangana",
        address: "Plot No. 42, Gachibowli High Street, Gachibowli, Hyderabad, 500032"
      },
      {
        ifsc: "HDFC0001620",
        branchName: "Jubilee Hills Road No 36",
        city: "Hyderabad",
        state: "Telangana",
        address: "Plot No. 712, Jubilee Hills Road No 36, Hyderabad, 500033"
      },
      {
        ifsc: "HDFC0000018",
        branchName: "T Nagar Branch",
        city: "Chennai",
        state: "Tamil Nadu",
        address: "No. 40, G.N. Chetty Road, T Nagar, Chennai, 600017"
      },
      {
        ifsc: "HDFC0000129",
        branchName: "Salt Lake Sector V",
        city: "Kolkata",
        state: "West Bengal",
        address: "Block EP & GP, Sector V, Salt Lake, Kolkata, 700091"
      }
    ]
  },
  {
    bankId: "icici",
    bankName: "ICICI Bank",
    branches: [
      {
        ifsc: "ICIC0000002",
        branchName: "MG Road Main Branch",
        city: "Bengaluru",
        state: "Karnataka",
        address: "Raheja Towers, MG Road, Bengaluru, 560001"
      },
      {
        ifsc: "ICIC0001243",
        branchName: "HSR Layout Sector 2",
        city: "Bengaluru",
        state: "Karnataka",
        address: "No. 453, 14th Main Road, HSR Layout Sector 2, Bengaluru, 560102"
      },
      {
        ifsc: "ICIC0000043",
        branchName: "Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
        address: "ICICI Bank Towers, Bandra Kurla Complex, Mumbai, 400051"
      },
      {
        ifsc: "ICIC0000011",
        branchName: "Worli Lotus",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Lotus House, Dr. Annie Besant Road, Worli, Mumbai, 400018"
      },
      {
        ifsc: "ICIC0000007",
        branchName: "Connaught Place Block E",
        city: "New Delhi",
        state: "Delhi",
        address: "E-1, Connaught Place, New Delhi, 110001"
      },
      {
        ifsc: "ICIC0000245",
        branchName: "Vasant Kunj Stage II",
        city: "New Delhi",
        state: "Delhi",
        address: "Sector B, Pocket 11, Vasant Kunj, New Delhi, 110070"
      },
      {
        ifsc: "ICIC0001824",
        branchName: "HITEC City Phase 2",
        city: "Hyderabad",
        state: "Telangana",
        address: "Cyber Towers, HITEC City, Hyderabad, 500081"
      },
      {
        ifsc: "ICIC0000346",
        branchName: "Nungambakkam High Road",
        city: "Chennai",
        state: "Tamil Nadu",
        address: "No. 110, Nungambakkam High Road, Chennai, 600034"
      }
    ]
  },
  {
    bankId: "sbi",
    bankName: "State Bank of India",
    branches: [
      {
        ifsc: "SBIN0001234",
        branchName: "St. Mark's Road Main",
        city: "Bengaluru",
        state: "Karnataka",
        address: "No. 13, St Mark's Road, Bengaluru, 560001"
      },
      {
        ifsc: "SBIN0003847",
        branchName: "Koramangala 8th Block",
        city: "Bengaluru",
        state: "Karnataka",
        address: "80 Feet Road, Koramangala 8th Block, Bengaluru, 565095"
      },
      {
        ifsc: "SBIN0000234",
        branchName: "Dadar West",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Dadar Railway Station Road, Dadar West, Mumbai, 400028"
      },
      {
        ifsc: "SBIN0001923",
        branchName: "Powai Galleria",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Hiranandani Gardens, Powai, Mumbai, 400076"
      },
      {
        ifsc: "SBIN0000691",
        branchName: "Parliament Street Main",
        city: "New Delhi",
        state: "Delhi",
        address: "11, Parliament Street, New Delhi, 110001"
      },
      {
        ifsc: "SBIN0040523",
        branchName: "Ameerpet Road",
        city: "Hyderabad",
        state: "Telangana",
        address: "Main Road Ameerpet, Hyderabad, 500016"
      },
      {
        ifsc: "SBIN0004521",
        branchName: "Salt Lake Central",
        city: "Kolkata",
        state: "West Bengal",
        address: "Salt Lake City, Block BD, Kolkata, 700064"
      }
    ]
  },
  {
    bankId: "axis",
    bankName: "Axis Bank",
    branches: [
      {
        ifsc: "UTIB0000245",
        branchName: "Indiranagar Double Road",
        city: "Bengaluru",
        state: "Karnataka",
        address: "No. 402, 100 Feet Road, Indiranagar 1st Stage, Bengaluru, 560038"
      },
      {
        ifsc: "UTIB0000095",
        branchName: "Fort Corporate Branch",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Sir P.M. Road, Fort, Mumbai, 400001"
      },
      {
        ifsc: "UTIB0000015",
        branchName: "Green Park Extension",
        city: "New Delhi",
        state: "Delhi",
        address: "J-13, Green Park Main, New Delhi, 110016"
      },
      {
        ifsc: "UTIB0001221",
        branchName: "Madhapur Jubilee Hills",
        city: "Hyderabad",
        state: "Telangana",
        address: "Plot No. 12, Kavuri Hills, Madhapur, Hyderabad, 500081"
      }
    ]
  },
  {
    bankId: "pnb",
    bankName: "Punjab National Bank",
    branches: [
      {
        ifsc: "PUNB0000300",
        branchName: "Connaught Circus",
        city: "New Delhi",
        state: "Delhi",
        address: "E-Block, Connaught Place, New Delhi, 110001"
      },
      {
        ifsc: "PUNB0000021",
        branchName: "Fort Branch HQ",
        city: "Mumbai",
        state: "Maharashtra",
        address: "P.M. Road, Fort, Mumbai, 400001"
      },
      {
        ifsc: "PUNB0024920",
        branchName: "Jayanagar Residential",
        city: "Bengaluru",
        state: "Karnataka",
        address: "9th Main Road, Jayanagar 3rd Block, Bengaluru, 560011"
      }
    ]
  }
];
