class Store:
    def __init__(self, name):
        self.data: dict[str, any] = {}
        self.name: str = name

    def get_item(self, key: str):
        return self.data[key]

    def set_item(self, key: str, value: any):
        self.data[key] = value
        return True

    def delete_item(self, key: str):
        del self.data[key]
        return True


store = Store("app:global")
