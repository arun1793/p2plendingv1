package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"
	//"strings"
	//"reflect"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var userIndexStr = "_userindex"

//var campaignIndexStr= "_campaignindex"
//var transactionIndexStr= "_transactionindex"

type User struct {
	Id       int    `json:"id"`
	Name     string `json:"name"` //the fieldtags of user are needed to store in the ledger
	Email    string `json:"email"`
	Phone    int    `json:"phone"`
	Pan      string `json:"pan"`
	Aadhar   int    `json:"aadhar"`
	Upi      string `json:"upi"`
	UserType string `json:"usertype"`
	PassPin  int    `json:"passpin"`
}

type AllUsers struct {
	Userlist []User `json:"userlist"`
}

type SessionAunthentication struct {
	Token string `json:"token"`
	Email string `json:"email"`
}
type Session struct {
	StoreSession []SessionAunthentication `json:"session"`
}

type BidInfo struct {
	Id              int     `json:"id"`
	BidCreationTime int64   `json:"bidcreationtime"`
	CampaignId      int     `json:"campaignid"`
	UserId          string  `json:"userid"`
	Quote           float64 `json:"quote"`
}
type CreateCampaign struct {
	Status           string    `json:"status"`
	Id               int       `json:"id"`
	UserId           string    `json:"userid"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	LoanAmount       int       `json:"loanamount"`
	Interest         float64   `json:"interest"`
	NoOfTerms        int       `json:"noOfTerms"`
	Bidlist          []BidInfo `json:"bidlist"`
	LowestBid        BidInfo   `json:"bidinfo"`
	NotermsRemaining int       `json:"notermsremaining"`
}
type CampaignList struct {
	Campaignlist []CreateCampaign `json:"campaignlist"`
}

type SimpleChaincode struct {
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

func (t *SimpleChaincode) Init(APIstub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke is ur entry point to invoke a chaincode function
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)
	// Handle different functions
	if function == "write" {
		return t.write(stub, args)

	} else if function == "read" {
		return t.read(stub, args) //writes a value to the chaincode state

	} else if function == "Delete" {
		return t.Delete(stub, args)

	} else if function == "CreateCampaign" {
		return t.CreateCampaign(stub, args)

	} else if function == "PostBid" {
		return t.PostBid(stub, args)

	} else if function == "UpdatePayment" {
		return t.UpdatePayment(stub, args)

	}

	fmt.Println("invoke did not find func: " + function)

	return shim.Error("Received unknown invoke function name - '" + function + "'")
}

// write - invoke function to write key/value pair
func (t *SimpleChaincode) write(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error
	fmt.Println("starting write")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2. key of the variable and value to set")
	}

	// input sanitation

	key = args[0] //rename for funsies
	value = args[1]
	err = stub.PutState(key, []byte(value)) //write the variable into the ledger
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end write")
	return shim.Success(nil)
}

// Query is our entry point for queries
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Error("Unknown supported call - Query()")
}

// read - query function to read key/value pair

func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation

	key = args[0]
	valAsbytes, err := stub.GetState(key) //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("- end read")
	return shim.Success(valAsbytes) //send it onward
}

func (t *SimpleChaincode) Delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	name := args[0]
	err := stub.DelState(name) //remove the key from chaincode state
	if err != nil {
		return shim.Error(err.Error())
	}

	//get the user index
	userAsBytes, err := stub.GetState(userIndexStr)
	if err != nil {
		return shim.Error(err.Error())
	}
	var userIndex []string
	json.Unmarshal(userAsBytes, &userIndex) //un stringify it aka JSON.parse()

	//remove user from index
	for i, val := range userIndex {
		fmt.Println(strconv.Itoa(i) + " - looking at " + val + " for " + name)
		if val == name { //find the correct index

			userIndex = append(userIndex[:i], userIndex[i+1:]...) //remove it
			for x := range userIndex {                            //debug prints...
				fmt.Println(string(x) + " - " + userIndex[x])
			}
			break
		}
	}
	jsonAsBytes, _ := json.Marshal(userIndex) //save new index
	err = stub.PutState(userIndexStr, jsonAsBytes)
	return shim.Success(nil)
}

func (t *SimpleChaincode) CreateCampaign(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var err error
	if len(args) != 8 {
		return shim.Error(" hi Incorrect number of arguments. Expecting 8")
	}
	//input sanitation
	fmt.Println("- start filling Campaign detail")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2st argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
	if len(args[4]) <= 0 {
		return shim.Error("5th argument must be a non-empty string")
	}
	if len(args[5]) <= 0 {
		return shim.Error("6th argument must be a non-empty string")
	}
	if len(args[6]) <= 0 {
		return shim.Error("7th argument must be a non-empty string")
	}
	if len(args[7]) <= 0 {
		return shim.Error("8th argument must be a non-empty string")
	}
	cuser := CreateCampaign{}
	cuser.Status = args[0]
	cuser.Id, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Failed to get Id as cannot convert it to int")
	}
	cuser.UserId = args[2]

	cuser.Title = args[3]
	cuser.Description = args[4]
	cuser.LoanAmount, err = strconv.Atoi(args[5])
	if err != nil {
		return shim.Error("Failed to get LoanAmount as cannot convert it to int")
	}
	cuser.Interest, err = strconv.ParseFloat(args[6], 32)
	if err != nil {
		return shim.Error("Failed to get interest as cannot convert it to int")
	}
	cuser.NoOfTerms, err = strconv.Atoi(args[7])
	if err != nil {
		return shim.Error("Failed to get NoOfTerms as cannot convert it to int")
	}
	fmt.Println("cuser", cuser)

	UserAsBytes, err := stub.GetState("getcusers")
	if err != nil {
		return shim.Error("Failed to get UserAsBytes as cannot convert it to int")
	}
	var campaignlist CampaignList
	json.Unmarshal(UserAsBytes, &campaignlist) //un stringify it aka JSON.parse()

	campaignlist.Campaignlist = append(campaignlist.Campaignlist, cuser)
	fmt.Println("campaignallusers", campaignlist.Campaignlist) //append to allusers
	fmt.Println("! appended cuser to campaignallusers")
	jsonAsBytes, _ := json.Marshal(campaignlist)
	fmt.Println("json", jsonAsBytes)
	err = stub.PutState("getcusers", jsonAsBytes) //rewrite allusers
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("- end campaignlist")
	return shim.Success(nil)
}

func (t *SimpleChaincode) PostBid(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	//input sanitation
	fmt.Println("- start PostBid")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}

	bid := BidInfo{}
	bid.Id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Failed to get id as cannot convert it to int")
	}
	bid.BidCreationTime = makeTimestamp()
	bid.CampaignId, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Failed to get CampaignId as cannot convert it to int")
	}
	bid.UserId = args[2]
	bid.Quote, err = strconv.ParseFloat(args[3], 32)
	if err != nil {
		return shim.Error("Failed to get Qoute as cannot convert it to int")
	}

	fmt.Println("bid", bid)

	UserAsBytes, err := stub.GetState("getcusers")
	if err != nil {
		return shim.Error(err.Error())
	}

	var campaignlist CampaignList
	json.Unmarshal(UserAsBytes, &campaignlist)

	for i := 0; i < len(campaignlist.Campaignlist); i++ {

		if campaignlist.Campaignlist[i].Id == bid.CampaignId {
			if campaignlist.Campaignlist[0].Bidlist == nil {
				campaignlist.Campaignlist[i].Bidlist = append(campaignlist.Campaignlist[i].Bidlist, bid)
				campaignlist.Campaignlist[i].LowestBid = bid
			} else if campaignlist.Campaignlist[i].LowestBid.Quote > bid.Quote {
				campaignlist.Campaignlist[i].Bidlist = append(campaignlist.Campaignlist[i].Bidlist, bid)
				campaignlist.Campaignlist[i].LowestBid = bid

			}

			jsonAsBytes, _ := json.Marshal(campaignlist)
			fmt.Println("json", jsonAsBytes)
			err = stub.PutState("getcusers", jsonAsBytes) //rewrite allusers
			if err != nil {
				return shim.Error(err.Error())
			}
		}
	}
	fmt.Println("- end postbid")
	return shim.Success(nil)
} //un stringify it aka JSON.parse()

func (t *SimpleChaincode) UpdatePayment(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	//input sanitation
	fmt.Println("- start registration")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}

	CampaignId, err := strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Failed to get CampaignId as cannot convert it to int")
	}

	UserId := args[1]

	TransactionId := args[2]
	fmt.Println("TransactionId", TransactionId)
	UserAsBytes, err := stub.GetState("getcusers")
	if err != nil {
		return shim.Error("Failed to get users")
	}

	var campaignlist CampaignList
	json.Unmarshal(UserAsBytes, &campaignlist)

	for i := 0; i < len(campaignlist.Campaignlist); i++ {
		if campaignlist.Campaignlist[i].Id == CampaignId && campaignlist.Campaignlist[i].UserId == UserId {
			if campaignlist.Campaignlist[i].NotermsRemaining == 0 {
				campaignlist.Campaignlist[i].NotermsRemaining = campaignlist.Campaignlist[i].NoOfTerms
			} else {
				campaignlist.Campaignlist[i].NotermsRemaining = campaignlist.Campaignlist[i].NotermsRemaining - 1

			}

			jsonAsBytes, _ := json.Marshal(campaignlist)
			fmt.Println("json", jsonAsBytes)
			err = stub.PutState("getcusers", jsonAsBytes) //rewrite allusers
			if err != nil {
				return shim.Error("Failed to get users")
			}
		}
	}

	fmt.Println("- end updatepayment")
	return shim.Success(nil)
} //un stringify it aka JSON.parse()

func makeTimestamp() int64 {
	return time.Now().UnixNano() / (int64(time.Millisecond) / int64(time.Nanosecond))
}
