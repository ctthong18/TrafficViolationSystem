from datetime import datetime, timedelta
import secrets
from typing import Optional
from urllib.parse import quote

class BankQRService:
    def __init__(self):
        # Thông tin tài khoản ngân hàng
        self.bank_config = {
            'bank_name': 'TECHCOMBANK',
            'account_number': '19039766482011',
            'account_holder': 'CHU THANH THONG',
            'bank_bin': '970407',  # BIN ngân hàng
            'template': 'Ds5Yf3F'  # Template ID cho VietQR
        }
        # Base URL cho VietQR API
        self.vietqr_base_url = 'https://img.vietqr.io/image'
    def _emv(self, tag: str, value: str):
        length = f"{len(value):02d}"
        return f"{tag}{length}{value}"

    def _crc16(self, data: str):
        poly = 0x1021
        reg = 0xFFFF
        for byte in data.encode("utf-8"):
            reg ^= (byte << 8)
            for _ in range(8):
                if reg & 0x8000:
                    reg = (reg << 1) ^ poly
                else:
                    reg <<= 1
                reg &= 0xFFFF
        return f"{reg:04X}"

    def generate_bank_qr_content(self, amount: float, transaction_id: str, content: str) -> str:
        """
        Tạo nội dung QR code theo chuẩn ngân hàng Việt Nam
        """
        qr_text = (
            f"{self.bank_config['bank_bin']}|"
            f"{self.bank_config['account_number']}|"
            f"{self.bank_config['account_holder']}|"
            f"{int(amount)}|"
            f"{content}|"
            f"{transaction_id}"
        )
        return qr_text

    def generate_vietqr(self, amount: float, description: str) -> str:
        bank_bin = self.bank_config["bank_bin"]
        acc_no = self.bank_config["account_number"]

        # Merchant Account Info (ID = 38)
        mai = (
            self._emv("00", "A000000727") +          # AID
            self._emv("01", bank_bin) +             # Bank BIN
            self._emv("02", acc_no)                 # Account Number
        )
        mai_full = self._emv("38", mai)

        payload = (
            self._emv("00", "01") +                 # Payload Format Indicator
            self._emv("01", "11") +                 # Static QR
            mai_full +                              # Merchant account info
            self._emv("53", "704") +                # Currency (VND)
            self._emv("54", f"{int(amount)}") +     # Amount
            self._emv("58", "VN") +                 # Country
            self._emv("59", self.bank_config["account_holder"]) +  # Name
            self._emv("purpose", description)       # Custom field
        )

        # Add CRC placeholder
        crc_input = payload + "6304"
        crc = self._crc16(crc_input)

        return payload + "63" + "04" + crc

    def create_payment_qr(self, amount: float, user_id: int, description="Thanh toan phat"):
        """
        Tạo QR code thanh toán sử dụng VietQR API
        Trả về URL của QR code thay vì base64 image
        """
        transaction_id = f"QR{secrets.token_hex(8).upper()}"
        desc = f"{description} {transaction_id}"

        # Tạo VietQR URL theo template:
        # https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
        bank_id = self.bank_config["bank_bin"]
        account_no = self.bank_config["account_number"]
        template = self.bank_config["template"]
        account_name = self.bank_config["account_holder"]

        # URL encode các tham số
        encoded_desc = quote(desc)
        encoded_account_name = quote(account_name)

        # Tạo VietQR URL
        qr_url = (
            f"{self.vietqr_base_url}/"
            f"{bank_id}-{account_no}-{template}.png"
            f"?amount={int(amount)}"
            f"&addInfo={encoded_desc}"
            f"&accountName={encoded_account_name}"
        )

        expiry = datetime.now() + timedelta(minutes=30)

        return {
            "qr_url": qr_url,
            "qr_transaction_id": transaction_id,
            "qr_expiry": expiry,
            "amount": amount,
            "bank_account": self.bank_config["account_number"],
            "bank_name": self.bank_config["bank_name"],
            "transfer_content": desc
        }
